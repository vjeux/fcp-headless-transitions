__ZN19FFPlaybackStateInfoC1E6CMTimeddS0_:
0000000000d725a0	pushq	%rbp
0000000000d725a1	movq	%rsp, %rbp
0000000000d725a4	movq	0x20(%rbp), %rax
0000000000d725a8	movq	%rax, 0x10(%rdi)
0000000000d725ac	movaps	0x10(%rbp), %xmm2
0000000000d725b0	movups	%xmm2, (%rdi)
0000000000d725b3	movups	0x28(%rbp), %xmm2
0000000000d725b7	movups	%xmm2, 0x18(%rdi)
0000000000d725bb	movq	0x38(%rbp), %rax
0000000000d725bf	movq	%rax, 0x28(%rdi)
0000000000d725c3	movsd	%xmm0, 0x30(%rdi)
0000000000d725c8	movsd	%xmm1, 0x38(%rdi)
0000000000d725cd	movb	$0x1, 0x40(%rdi)
0000000000d725d1	popq	%rbp
0000000000d725d2	retq
0000000000d725d3	nopw	%cs:(%rax,%rax)
