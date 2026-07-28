__ZN23HGBilateralFilterInterp13SetRangeScaleEf:
00000000001091a0	pushq	%rbp
00000000001091a1	movq	%rsp, %rbp
00000000001091a4	pushq	%rbx
00000000001091a5	subq	$0x18, %rsp
00000000001091a9	movaps	%xmm0, -0x20(%rbp)
00000000001091ad	movq	%rdi, %rbx
00000000001091b0	callq	__ZN6HGNode9ClearBitsEv         ## HGNode::ClearBits()
00000000001091b5	movaps	0x2bea74(%rip), %xmm1
00000000001091bc	movaps	-0x20(%rbp), %xmm2
00000000001091c0	andps	%xmm2, %xmm1
00000000001091c3	xorps	%xmm0, %xmm0
00000000001091c6	cmpneqss	%xmm2, %xmm0
00000000001091cb	movaps	0x2bea6e(%rip), %xmm2
00000000001091d2	blendvps	%xmm0, %xmm1, %xmm2
00000000001091d7	movss	%xmm2, 0x1d8(%rbx)
00000000001091df	addq	$0x18, %rsp
00000000001091e3	popq	%rbx
00000000001091e4	popq	%rbp
00000000001091e5	retq
00000000001091e6	nopw	%cs:(%rax,%rax)
