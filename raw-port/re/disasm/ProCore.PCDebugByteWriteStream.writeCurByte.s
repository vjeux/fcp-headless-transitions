
/tmp/ProCore.x86_64:	file format mach-o 64-bit x86-64

Disassembly of section __TEXT,__text:

0000000000023626 <__ZN22PCDebugByteWriteStream12writeCurByteEv>:
   23626: 55                           	pushq	%rbp
   23627: 48 89 e5                     	movq	%rsp, %rbp
   2362a: 41 56                        	pushq	%r14
   2362c: 53                           	pushq	%rbx
   2362d: 48 89 fb                     	movq	%rdi, %rbx
   23630: 48 8b 05 f1 4b 12 00         	movq	0x124bf1(%rip), %rax    ## 0x148228 <_xmlTextReaderReadString+0x148228>
   23637: 48 8b 38                     	movq	(%rax), %rdi
   2363a: 4c 8d 73 08                  	leaq	0x8(%rbx), %r14
   2363e: 0f b6 53 08                  	movzbl	0x8(%rbx), %edx
   23642: 48 8d 35 08 e5 10 00         	leaq	0x10e508(%rip), %rsi    ## 0x131b51 <__ZL10encodeVals+0x41>
   23649: 31 c0                        	xorl	%eax, %eax
   2364b: e8 38 b2 0b 00               	callq	0xde888 <_xmlTextReaderReadString+0xde888>
   23650: 48 8d 7b 18                  	leaq	0x18(%rbx), %rdi
   23654: 8b 73 18                     	movl	0x18(%rbx), %esi
   23657: 4c 89 f2                     	movq	%r14, %rdx
   2365a: e8 11 00 00 00               	callq	0x23670 <__ZN14PCDynamicArrayIhE6insertEjRKh>
   2365f: c6 43 08 00                  	movb	$0x0, 0x8(%rbx)
   23663: c7 43 0c 08 00 00 00         	movl	$0x8, 0xc(%rbx)
   2366a: 5b                           	popq	%rbx
   2366b: 41 5e                        	popq	%r14
   2366d: 5d                           	popq	%rbp
   2366e: c3                           	retq
   2366f: 90                           	nop
