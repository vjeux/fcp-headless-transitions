
/tmp/Ozone.x86_64:	file format mach-o 64-bit x86-64

Disassembly of section __TEXT,__text:

00000000000a9e40 <__ZN19OZChannelDoubleImplD1Ev>:
   a9e40: 55                           	pushq	%rbp
   a9e41: 48 89 e5                     	movq	%rsp, %rbp
   a9e44: 53                           	pushq	%rbx
   a9e45: 50                           	pushq	%rax
   a9e46: 48 89 fb                     	movq	%rdi, %rbx
   a9e49: 48 83 c7 28                  	addq	$0x28, %rdi
   a9e4d: e8 ec 37 63 00               	callq	0x6dd63e <_wmemchr+0x6dd63e>
   a9e52: 48 89 df                     	movq	%rbx, %rdi
   a9e55: 48 83 c4 08                  	addq	$0x8, %rsp
   a9e59: 5b                           	popq	%rbx
   a9e5a: 5d                           	popq	%rbp
   a9e5b: e9 9e 3b 63 00               	jmp	0x6dd9fe <_wmemchr+0x6dd9fe>

00000000000a9e60 <__ZN19OZChannelDoubleImplD0Ev>:
   a9e60: 55                           	pushq	%rbp
   a9e61: 48 89 e5                     	movq	%rsp, %rbp
   a9e64: 53                           	pushq	%rbx
   a9e65: 50                           	pushq	%rax
   a9e66: 48 89 fb                     	movq	%rdi, %rbx
   a9e69: 48 83 c7 28                  	addq	$0x28, %rdi
   a9e6d: e8 cc 37 63 00               	callq	0x6dd63e <_wmemchr+0x6dd63e>
   a9e72: 48 89 df                     	movq	%rbx, %rdi
   a9e75: e8 84 3b 63 00               	callq	0x6dd9fe <_wmemchr+0x6dd9fe>
   a9e7a: 48 89 df                     	movq	%rbx, %rdi
   a9e7d: 48 83 c4 08                  	addq	$0x8, %rsp
