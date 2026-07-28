
/tmp/ProCore.x86_64:	file format mach-o 64-bit x86-64

Disassembly of section __TEXT,__text:

000000000002356c <__ZN22PCDebugByteWriteStream11writeStreamER17PCByteWriteStream>:
   2356c: 83 7e 18 00                  	cmpl	$0x0, 0x18(%rsi)
   23570: 74 52                        	je	0x235c4 <__ZN22PCDebugByteWriteStream11writeStreamER17PCByteWriteStream+0x58>
   23572: 55                           	pushq	%rbp
   23573: 48 89 e5                     	movq	%rsp, %rbp
   23576: 41 57                        	pushq	%r15
   23578: 41 56                        	pushq	%r14
   2357a: 41 55                        	pushq	%r13
   2357c: 41 54                        	pushq	%r12
   2357e: 53                           	pushq	%rbx
   2357f: 50                           	pushq	%rax
   23580: 48 89 f3                     	movq	%rsi, %rbx
   23583: 4c 8b 7e 20                  	movq	0x20(%rsi), %r15
   23587: 4c 8b 25 9a 4c 12 00         	movq	0x124c9a(%rip), %r12    ## 0x148228 <_xmlTextReaderReadString+0x148228>
   2358e: 4c 8d 35 bc e5 10 00         	leaq	0x10e5bc(%rip), %r14    ## 0x131b51 <__ZL10encodeVals+0x41>
   23595: 45 31 ed                     	xorl	%r13d, %r13d
   23598: 49 8b 3c 24                  	movq	(%r12), %rdi
   2359c: 43 0f b6 14 2f               	movzbl	(%r15,%r13), %edx
   235a1: 4c 89 f6                     	movq	%r14, %rsi
   235a4: 31 c0                        	xorl	%eax, %eax
   235a6: e8 dd b2 0b 00               	callq	0xde888 <_xmlTextReaderReadString+0xde888>
   235ab: 49 ff c5                     	incq	%r13
   235ae: 8b 43 18                     	movl	0x18(%rbx), %eax
   235b1: 49 39 c5                     	cmpq	%rax, %r13
   235b4: 72 e2                        	jb	0x23598 <__ZN22PCDebugByteWriteStream11writeStreamER17PCByteWriteStream+0x2c>
   235b6: 48 83 c4 08                  	addq	$0x8, %rsp
   235ba: 5b                           	popq	%rbx
   235bb: 41 5c                        	popq	%r12
   235bd: 41 5d                        	popq	%r13
   235bf: 41 5e                        	popq	%r14
   235c1: 41 5f                        	popq	%r15
   235c3: 5d                           	popq	%rbp
   235c4: c3                           	retq
   235c5: 90                           	nop
