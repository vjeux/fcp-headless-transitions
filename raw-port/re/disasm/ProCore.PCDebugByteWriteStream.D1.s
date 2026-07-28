
/tmp/ProCore.x86_64:	file format mach-o 64-bit x86-64

Disassembly of section __TEXT,__text:

00000000000235c6 <__ZN22PCDebugByteWriteStreamD1Ev>:
   235c6: 55                           	pushq	%rbp
   235c7: 48 89 e5                     	movq	%rsp, %rbp
   235ca: 53                           	pushq	%rbx
   235cb: 50                           	pushq	%rax
   235cc: 48 89 fb                     	movq	%rdi, %rbx
   235cf: 48 8d 05 02 5f 12 00         	leaq	0x125f02(%rip), %rax    ## 0x1494d8 <__ZTV17PCByteWriteStream+0x10>
   235d6: 48 89 07                     	movq	%rax, (%rdi)
   235d9: 48 8b 7f 20                  	movq	0x20(%rdi), %rdi
   235dd: 48 85 ff                     	testq	%rdi, %rdi
   235e0: 74 05                        	je	0x235e7 <__ZN22PCDebugByteWriteStreamD1Ev+0x21>
   235e2: e8 d3 b0 0b 00               	callq	0xde6ba <_xmlTextReaderReadString+0xde6ba>
   235e7: 48 c7 43 20 00 00 00 00      	movq	$0x0, 0x20(%rbx)
   235ef: 48 83 c4 08                  	addq	$0x8, %rsp
   235f3: 5b                           	popq	%rbx
   235f4: 5d                           	popq	%rbp
   235f5: c3                           	retq
