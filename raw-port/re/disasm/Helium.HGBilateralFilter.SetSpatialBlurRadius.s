__ZN17HGBilateralFilter20SetSpatialBlurRadiusEf:
00000000001c8940	pushq	%rbp
00000000001c8941	movq	%rsp, %rbp
00000000001c8944	pushq	%rbx
00000000001c8945	pushq	%rax
00000000001c8946	movss	%xmm0, -0xc(%rbp)
00000000001c894b	movq	%rdi, %rbx
00000000001c894e	callq	__ZN6HGNode9ClearBitsEv         ## HGNode::ClearBits()
00000000001c8953	movss	-0xc(%rbp), %xmm0
00000000001c8958	movss	%xmm0, 0x1a8(%rbx)
00000000001c8960	addq	$0x8, %rsp
00000000001c8964	popq	%rbx
00000000001c8965	popq	%rbp
00000000001c8966	retq
00000000001c8967	nopw	(%rax,%rax)
