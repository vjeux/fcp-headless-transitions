
/tmp/ProChannel.x86_64:	file format mach-o 64-bit x86-64

Disassembly of section __TEXT,__text:

00000000000a46e6 <__ZN23OZChannelSegmentVisitor9mapRepeatERK6CMTimeS2_S2_b>:
   a46e6: 55                           	pushq	%rbp
   a46e7: 48 89 e5                     	movq	%rsp, %rbp
   a46ea: 53                           	pushq	%rbx
   a46eb: 50                           	pushq	%rax
   a46ec: 48 89 fb                     	movq	%rdi, %rbx
   a46ef: 4c 8d 4d f0                  	leaq	-0x10(%rbp), %r9
   a46f3: e8 0a 00 00 00               	callq	0xa4702 <__ZN23OZChannelSegmentVisitor20mapProgressiveRepeatERK6CMTimeS2_S2_bRl>
   a46f8: 48 89 d8                     	movq	%rbx, %rax
   a46fb: 48 83 c4 08                  	addq	$0x8, %rsp
   a46ff: 5b                           	popq	%rbx
   a4700: 5d                           	popq	%rbp
   a4701: c3                           	retq
