__ZN11HGToneCurve18SetToneCurveParamsENS_15hgToneCurveFormEfffffff:
0000000000248cf0	pushq	%rbp
0000000000248cf1	movq	%rsp, %rbp
0000000000248cf4	pushq	%r14
0000000000248cf6	pushq	%rbx
0000000000248cf7	subq	$0x20, %rsp
0000000000248cfb	movss	%xmm6, -0x2c(%rbp)
0000000000248d00	movss	%xmm5, -0x28(%rbp)
0000000000248d05	movss	%xmm4, -0x24(%rbp)
0000000000248d0a	movss	%xmm3, -0x20(%rbp)
0000000000248d0f	movss	%xmm2, -0x1c(%rbp)
0000000000248d14	movss	%xmm1, -0x18(%rbp)
0000000000248d19	movss	%xmm0, -0x14(%rbp)
0000000000248d1e	movl	%esi, %r14d
0000000000248d21	movq	%rdi, %rbx
0000000000248d24	callq	__ZN6HGNode9ClearBitsEv         ## HGNode::ClearBits()
0000000000248d29	xorl	%eax, %eax
0000000000248d2b	testl	%r14d, %r14d
0000000000248d2e	cmovgl	%r14d, %eax
0000000000248d32	cmpl	$0x4, %eax
0000000000248d35	movl	$0x4, %edi
0000000000248d3a	cmovll	%eax, %edi
0000000000248d3d	movl	%edi, 0x198(%rbx)
0000000000248d43	movss	-0x14(%rbp), %xmm0
0000000000248d48	movss	%xmm0, 0x1b8(%rbx)
0000000000248d50	movss	-0x18(%rbp), %xmm1
0000000000248d55	movss	%xmm1, 0x1bc(%rbx)
0000000000248d5d	movss	-0x1c(%rbp), %xmm2
0000000000248d62	movss	%xmm2, 0x1c0(%rbx)
0000000000248d6a	movss	-0x20(%rbp), %xmm3
0000000000248d6f	movss	%xmm3, 0x1c4(%rbx)
0000000000248d77	movss	-0x24(%rbp), %xmm4
0000000000248d7c	movss	%xmm4, 0x1c8(%rbx)
0000000000248d84	movss	-0x28(%rbp), %xmm5
0000000000248d89	movss	%xmm5, 0x1cc(%rbx)
0000000000248d91	movss	-0x2c(%rbp), %xmm6
0000000000248d96	movss	%xmm6, 0x1d0(%rbx)
0000000000248d9e	callq	__ZN11HGToneCurve16AcceleratedStateENS_15hgToneCurveFormEfffffff ## HGToneCurve::AcceleratedState(HGToneCurve::hgToneCurveForm, float, float, float, float, float, float, float)
0000000000248da3	movl	%eax, 0x1a8(%rbx)
0000000000248da9	addq	$0x20, %rsp
0000000000248dad	popq	%rbx
0000000000248dae	popq	%r14
0000000000248db0	popq	%rbp
0000000000248db1	retq
0000000000248db2	nopw	%cs:(%rax,%rax)
