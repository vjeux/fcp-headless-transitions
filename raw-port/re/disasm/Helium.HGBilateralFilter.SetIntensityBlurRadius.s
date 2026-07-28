__ZN17HGBilateralFilter22SetIntensityBlurRadiusEf:
00000000001c8970	pushq	%rbp
00000000001c8971	movq	%rsp, %rbp
00000000001c8974	pushq	%rbx
00000000001c8975	pushq	%rax
00000000001c8976	movss	%xmm0, -0xc(%rbp)
00000000001c897b	movq	%rdi, %rbx
00000000001c897e	callq	__ZN6HGNode9ClearBitsEv         ## HGNode::ClearBits()
00000000001c8983	movss	-0xc(%rbp), %xmm0
00000000001c8988	movss	%xmm0, 0x1ac(%rbx)
00000000001c8990	addq	$0x8, %rsp
00000000001c8994	popq	%rbx
00000000001c8995	popq	%rbp
00000000001c8996	retq
00000000001c8997	nopw	(%rax,%rax)
