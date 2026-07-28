__ZN11HWrapMirror11setMaskRectERK6PCRectIdE:
0000000000470de0	pushq	%rbp
0000000000470de1	movq	%rsp, %rbp
0000000000470de4	movups	(%rsi), %xmm0
0000000000470de7	movups	0x10(%rsi), %xmm1
0000000000470deb	movups	%xmm1, 0x1b0(%rdi)
0000000000470df2	movups	%xmm0, 0x1a0(%rdi)
0000000000470df9	movsd	(%rsi), %xmm0
0000000000470dfd	movsd	0x8(%rsi), %xmm1
0000000000470e02	cvtsd2ss	%xmm0, %xmm0
0000000000470e06	cvtsd2ss	%xmm1, %xmm1
0000000000470e0a	movsd	0x10(%rsi), %xmm2
0000000000470e0f	cvtsd2ss	%xmm2, %xmm2
0000000000470e13	movsd	0x18(%rsi), %xmm3
0000000000470e18	cvtsd2ss	%xmm3, %xmm3
0000000000470e1c	movq	(%rdi), %rax
0000000000470e1f	movq	0x60(%rax), %rax
0000000000470e23	xorl	%esi, %esi
0000000000470e25	popq	%rbp
0000000000470e26	jmpq	*%rax
0000000000470e28	nopl	(%rax,%rax)
