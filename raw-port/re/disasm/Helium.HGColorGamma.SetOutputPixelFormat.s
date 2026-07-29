
/tmp/Helium.x86_64:	file format mach-o 64-bit x86-64

Disassembly of section __TEXT,__text:

00000000000fb690 <__ZN12HGColorGamma20SetOutputPixelFormatE8HGFormat13HGYCbCrFormat>:
   fb690: 55                           	pushq	%rbp
   fb691: 48 89 e5                     	movq	%rsp, %rbp
   fb694: 41 57                        	pushq	%r15
   fb696: 41 56                        	pushq	%r14
   fb698: 53                           	pushq	%rbx
   fb699: 50                           	pushq	%rax
   fb69a: 89 d3                        	movl	%edx, %ebx
   fb69c: 41 89 f6                     	movl	%esi, %r14d
   fb69f: 49 89 ff                     	movq	%rdi, %r15
   fb6a2: e8 e9 11 02 00               	callq	0x11c890 <__ZN6HGNode9ClearBitsEv>
   fb6a7: 41 c6 87 e9 02 00 00 01      	movb	$0x1, 0x2e9(%r15)
   fb6af: 45 89 b7 20 04 00 00         	movl	%r14d, 0x420(%r15)
   fb6b6: 41 89 9f 28 04 00 00         	movl	%ebx, 0x428(%r15)
   fb6bd: 4c 89 ff                     	movq	%r15, %rdi
   fb6c0: 48 83 c4 08                  	addq	$0x8, %rsp
   fb6c4: 5b                           	popq	%rbx
   fb6c5: 41 5e                        	popq	%r14
   fb6c7: 41 5f                        	popq	%r15
   fb6c9: 5d                           	popq	%rbp
   fb6ca: e9 11 fd ff ff               	jmp	0xfb3e0 <__ZN12HGColorGamma20SetYCbCrBiasAndScaleEv>
   fb6cf: 90                           	nop
