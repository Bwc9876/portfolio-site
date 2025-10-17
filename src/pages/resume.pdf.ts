import rawTypst from "@assets/resume.typ?raw"; 
import { spawn } from "node:child_process";

const compileTypst = (raw: string): Promise<Buffer> => {
  const cmd = spawn("typst", ["compile", "-f", "pdf", "-", "-"], {stdio: "pipe"});

  cmd.stdin.write(raw);
  cmd.stdin.end();

  return new Promise((resolve, reject) => {
    cmd.on("error", reject);
    
    let stderr = "";
    cmd.stderr.setEncoding("utf8");
    cmd.stderr.on("data", (data) => {
      stderr += data;
    });

    let stdout: Buffer | null = null;
    cmd.stdout.on("data", (data) => {
      if (stdout === null) {
        stdout = data;
      } else {
        stdout += data;
      }
    });

    cmd.on("exit", (code) => {
      if (code === 0) {
        if (stdout !== null) {
          resolve(stdout as Buffer);
        } else {
          reject(new Error(`No stdout, Stderr: ${stderr}`));
        } 
      } else {
        reject(new Error(`Exited with code ${code} Stderr: ${stderr}`));
      } 
    });


  });
};

export async function GET() {
  const data = await compileTypst(rawTypst);
  // @ts-expect-error "idk why it thinks this is wrong? Astro supports responses from a Buffer" 
  return new Response(data);
}
