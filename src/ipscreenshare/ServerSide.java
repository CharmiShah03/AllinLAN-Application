/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package ipscreenshare;

import com.sun.net.httpserver.BasicAuthenticator;
import com.sun.net.httpserver.HttpContext;
import com.sun.net.httpserver.HttpHandler;
import com.sun.net.httpserver.HttpServer;
import java.io.IOException;
import java.net.InetSocketAddress;
import java.net.SocketPermission;
import javax.swing.JTextArea;

public class ServerSide {
    

/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
    private static HttpServer server;
    ScreenThread screenThread;

    boolean _mousePointer;

 

    public boolean StartServer(JTextArea txtLog, String ip, int port) throws IOException {
        try {

            SocketPermission perm = new SocketPermission(ip + ":" + port, "connect, resolve");
            boolean b = perm.implies(perm);

            server = HttpServer.create(new InetSocketAddress(ip, port), 0);

            HttpContext context = server.createContext("/", (HttpHandler) new WebUserInterface());

            server.setExecutor(null); // creates a default executor
            server.start();
            return true;
        } catch (Exception ex) {
            InputDate.Log(txtLog, ex.getMessage());
            return false;
        }
    }

    public void StopServer(ScreenThread screenThread) throws IOException {
        screenThread.kill();
        server.stop(0);
    }

    public static String errorPageContent() {
        return "<h1 style=\"color:red\">Error 404 , File Not Found </h1><hr><a href=\".\\\">Back to Home</a>";
    }

}
