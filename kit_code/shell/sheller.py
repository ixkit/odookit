# -*- coding: utf-8 -*-
import subprocess
from time import sleep
import threading  


# command: ["python", "timer.py", "5"]
# on_echo: procss, message ={stdout,stderr,exitCode}
"""
    procss is Popen instance

    Popen.terminate()
    Stop the child. On POSIX OSs the method sends SIGTERM to the child. On Windows the Win32 API function TerminateProcess() is called to stop the child.

    Popen.kill()

""" 
def run(command,on_echo):
    if isinstance(command, str):
        command =  command.split()
    with subprocess.Popen(
        command, stdout=subprocess.PIPE, stderr=subprocess.PIPE  
        
    ) as process:

        go = not on_echo is None
        
        def poll_and_read():
            # print(f"Output from poll: {process.poll()}")
            # print(f"Output from stdout: {process.stdout.read1().decode('utf-8')}") 
             
            exit_code = process.poll()
            
            if not exit_code is None:
                on_echo(process,{'process exitcode':exit_code})
                return False
            
            #stdout, stderr = process.communicate()
            
            stdout = process.stdout.readline()
            #stderr = process.stderr.readline()
            # stdout = process.stdout.read1().decode('utf-8')
            # stderr = process.stderr.read1().decode('utf-8')
            stderr = "" 
            message ={}
            if not stdout == '':
                 # Split output into lines.
                stdout_buf = [s.rstrip("\n\r") for s in str(stdout, "utf8").splitlines()]
                message['stdout']=stdout_buf
            
            if not stderr == '': 
                #stderr_buf = [s.rstrip("\n\r") for s in str(stderr, "utf8").splitlines()]
                message['stderr']=stderr
            
            if len(message) == 0:
                
                return True 
            
            return on_echo(process,message)
             
        
        while go:
            go = poll_and_read()
            sleep(3)
        
def async_run(command,on_echo):
    thread = threading.Thread(target=run,args=(command,on_echo))
    thread.start()
    return thread