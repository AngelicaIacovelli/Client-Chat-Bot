#include <stdio.h>
#include <string.h>
#include "include/sans.h"

// Forward declaration of get_response
void get_response(int sock);

int http_client(const char *host, int port) {
    char method[4];
    char path[1024];
    char request[2048];
    int sock;

    // Prompt the user for method and path
    printf("Enter HTTP method (GET): ");
    scanf("%s", method);
    printf("Enter request path (without leading /): ");
    scanf("%s", path);

    // Validate the method
    if (strcmp(method, "GET") != 0) {
        printf("Only GET method is supported.\n");
        return 0;
    }

    // Connect to the server using sans_connect
    sock = sans_connect(host, port, 0);
    if (sock < 0) {
        printf("Failed to connect to %s:%d\n", host, port);
        return 0;
    }

    // Build the HTTP request
    snprintf(request, sizeof(request),
             "%s /%s HTTP/1.1\r\n"
             "Host: %s:%d\r\n"
             "User-Agent: sans/1.0\r\n"
             "Cache-Control: no-cache\r\n"
             "Connection: close\r\n"
             "Accept: */*\r\n"
             "\r\n", method, path, host, port);

    // Send the request using sans_send_pkt
    sans_send_pkt(sock, request, strlen(request));

    // Receive and print the response
    get_response(sock);

    // Disconnect using sans_disconnect
    sans_disconnect(sock);

    return 0;  // Return success
}

void get_response(int sock) {
    char buffer[1024];
    int bytes_received;
    int content_length = -1;  // Store content length (if found)
    int total_received = 0;
    int header_finished = 0;

    // Receive response
    while ((bytes_received = sans_recv_pkt(sock, buffer, sizeof(buffer) - 1)) > 0) {
        buffer[bytes_received] = '\0';  // Null-terminate the buffer

        // Check if we are still receiving headers
        if (!header_finished) {
            // Look for the end of the headers
            char *header_end = strstr(buffer, "\r\n\r\n");
            if (header_end) {
                header_finished = 1;
                header_end += 4;  // Move past the \r\n\r\n

                // Parse headers to find Content-Length (if present)
                char *content_length_str = strstr(buffer, "Content-Length: ");
                if (content_length_str) {
                    content_length_str += 16;  // Move past "Content-Length: "
                    content_length = strtol(content_length_str, NULL, 10);  // Convert to int
                }

                // Print headers
                printf("%.*s", (int)(header_end - buffer), buffer);

                // Handle the remaining data after headers
                int body_size = bytes_received - (header_end - buffer);
                total_received += body_size;
                printf("%.*s", body_size, header_end);  // Print remaining body data
            } else {
                // If no headers end found, print the buffer as headers
                printf("%s", buffer);
            }
        } else {
            // Headers are finished, we are receiving body now
            total_received += bytes_received;
            printf("%s", buffer);

            // Stop reading if we received all the content
            if (content_length != -1 && total_received >= content_length) {
                break;
            }
        }
    }

    // Connection closed by the server or error in receiving
    if (bytes_received == 0) {
        printf("Connection closed by server.\n");
    } else if (bytes_received < 0) {
        perror("Error receiving data");
    }
}
