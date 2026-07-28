__ZN22HGRetimeWithFrameBlend12SetParameterEiffff:
00000000001e3970	movl	$0xffffffff, %eax               ## imm = 0xFFFFFFFF
00000000001e3975	testl	%esi, %esi
00000000001e3977	je	0x1e397a
00000000001e3979	retq
00000000001e397a	xorps	%xmm1, %xmm1
00000000001e397d	ucomiss	%xmm0, %xmm1
00000000001e3980	ja	0x1e3992
00000000001e3982	movss	0x1e4336(%rip), %xmm1
00000000001e398a	ucomiss	%xmm1, %xmm0
00000000001e398d	ja	0x1e3992
00000000001e398f	movaps	%xmm0, %xmm1
00000000001e3992	pushq	%rbp
00000000001e3993	movq	%rsp, %rbp
00000000001e3996	movss	%xmm1, 0x198(%rdi)
00000000001e399e	callq	__ZN6HGNode9ClearBitsEv         ## HGNode::ClearBits()
00000000001e39a3	movl	$0x1, %eax
00000000001e39a8	popq	%rbp
00000000001e39a9	retq
00000000001e39aa	nopw	(%rax,%rax)
