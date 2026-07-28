
/tmp/ProCore.x86_64:	file format mach-o 64-bit x86-64

Disassembly of section __TEXT,__text:

00000000000235f6 <__ZN22PCDebugByteWriteStreamD0Ev>:
   235f6: 55                           	pushq	%rbp
   235f7: 48 89 e5                     	movq	%rsp, %rbp
   235fa: 53                           	pushq	%rbx
   235fb: 50                           	pushq	%rax
   235fc: 48 89 fb                     	movq	%rdi, %rbx
   235ff: 48 8d 05 d2 5e 12 00         	leaq	0x125ed2(%rip), %rax    ## 0x1494d8 <__ZTV17PCByteWriteStream+0x10>
   23606: 48 89 07                     	movq	%rax, (%rdi)
   23609: 48 8b 7f 20                  	movq	0x20(%rdi), %rdi
   2360d: 48 85 ff                     	testq	%rdi, %rdi
   23610: 74 05                        	je	0x23617 <__ZN22PCDebugByteWriteStreamD0Ev+0x21>
   23612: e8 a3 b0 0b 00               	callq	0xde6ba <_xmlTextReaderReadString+0xde6ba>
   23617: 48 89 df                     	movq	%rbx, %rdi
   2361a: 48 83 c4 08                  	addq	$0x8, %rsp
   2361e: 5b                           	popq	%rbx
   2361f: 5d                           	popq	%rbp
   23620: e9 9b b0 0b 00               	jmp	0xde6c0 <_xmlTextReaderReadString+0xde6c0>
   23625: 90                           	nop
