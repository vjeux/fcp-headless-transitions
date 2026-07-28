__ZN10PCLMSolver5solveEv:
00000000000b6f9e	pushq	%rbp
00000000000b6f9f	movq	%rsp, %rbp
00000000000b6fa2	pushq	%r15
00000000000b6fa4	pushq	%r14
00000000000b6fa6	pushq	%r13
00000000000b6fa8	pushq	%r12
00000000000b6faa	pushq	%rbx
00000000000b6fab	subq	$0x108, %rsp                    ## imm = 0x108
00000000000b6fb2	movq	%rdi, %rbx
00000000000b6fb5	movq	0x8(%rdi), %rdi
00000000000b6fb9	leaq	0x10(%rbx), %rsi
00000000000b6fbd	movq	(%rdi), %rax
00000000000b6fc0	movq	%rsi, -0xb8(%rbp)
00000000000b6fc7	callq	*0x10(%rax)
00000000000b6fca	movq	0x8(%rbx), %rdi
00000000000b6fce	leaq	0x40(%rbx), %r14
00000000000b6fd2	movq	(%rdi), %rax
00000000000b6fd5	movq	%r14, %rsi
00000000000b6fd8	callq	*0x18(%rax)
00000000000b6fdb	movq	%r14, %rdi
00000000000b6fde	callq	__ZN11PCGenVectorIfE6uniqueEv   ## PCGenVector<float>::unique()
00000000000b6fe3	movq	%rbx, %rdi
00000000000b6fe6	movq	%r14, -0xc0(%rbp)
00000000000b6fed	movq	%r14, %rsi
00000000000b6ff0	callq	__ZN10PCLMSolver14computeEpsilonERK11PCGenVectorIfE ## PCLMSolver::computeEpsilon(PCGenVector<float> const&)
00000000000b6ff5	movaps	%xmm0, -0x100(%rbp)
00000000000b6ffc	xorl	%r15d, %r15d
00000000000b6fff	leaq	-0xf0(%rbp), %rcx
00000000000b7006	movq	%r15, (%rcx)
00000000000b7009	movabsq	$0x100000000, %rax              ## imm = 0x100000000
00000000000b7013	movq	%rax, 0x8(%rcx)
00000000000b7017	movq	%r15, 0x10(%rcx)
00000000000b701b	leaq	-0x128(%rbp), %rcx
00000000000b7022	movq	%r15, (%rcx)
00000000000b7025	movq	%rax, 0x8(%rcx)
00000000000b7029	movq	%r15, 0x10(%rcx)
00000000000b702d	leaq	0x70(%rbx), %r14
00000000000b7031	leaq	0x28(%rbx), %rax
00000000000b7035	movq	%rax, -0x110(%rbp)
00000000000b703c	leaq	0x58(%rbx), %rax
00000000000b7040	movq	%rax, -0xa8(%rbp)
00000000000b7047	movb	$0x1, %cl
00000000000b7049	movss	0x6cb1f(%rip), %xmm0
00000000000b7051	movss	%xmm0, -0x34(%rbp)
00000000000b7056	xorl	%r13d, %r13d
00000000000b7059	xorl	%r12d, %r12d
00000000000b705c	incl	%r13d
00000000000b705f	cmpl	0x9c(%rbx), %r13d
00000000000b7066	jge	0xb7b25
00000000000b706c	movq	%r15, -0x108(%rbp)
00000000000b7073	testb	$0x1, %r12b
00000000000b7077	jne	0xb709c
00000000000b7079	testb	$0x1, %cl
00000000000b707c	jne	0xb708f
00000000000b707e	movq	0x8(%rbx), %rdi
00000000000b7082	movq	(%rdi), %rax
00000000000b7085	movq	-0xb8(%rbp), %rsi
00000000000b708c	callq	*0x10(%rax)
00000000000b708f	movq	0x8(%rbx), %rdi
00000000000b7093	movq	(%rdi), %rax
00000000000b7096	movq	%r14, %rsi
00000000000b7099	callq	*0x20(%rax)
00000000000b709c	movl	0x90(%rbx), %r15d
00000000000b70a3	movl	%r15d, %esi
00000000000b70a6	imull	%r15d, %esi
00000000000b70aa	leaq	-0x60(%rbp), %rdi
00000000000b70ae	callq	__ZN13PCGenBlockRefIfEC2Ei      ## PCGenBlockRef<float>::PCGenBlockRef(int)
00000000000b70b3	pmovsxbd	0x71114(%rip), %xmm0
00000000000b70bc	pinsrd	$0x0, %r15d, %xmm0
00000000000b70c3	pshufd	$0x10, %xmm0, %xmm0             ## xmm0 = xmm0[0,0,1,0]
00000000000b70c8	movdqu	%xmm0, -0x58(%rbp)
00000000000b70cd	movq	-0x60(%rbp), %rax
00000000000b70d1	movq	%rax, -0x48(%rbp)
00000000000b70d5	testl	%r15d, %r15d
00000000000b70d8	jle	0xb7104
00000000000b70da	leaq	(,%r15,4), %rcx
00000000000b70e2	xorl	%edx, %edx
00000000000b70e4	movq	%rax, %rsi
00000000000b70e7	movq	%r15, %rdi
00000000000b70ea	movl	$0x0, (%rsi)
00000000000b70f0	addq	%rcx, %rsi
00000000000b70f3	decq	%rdi
00000000000b70f6	jne	0xb70ea
00000000000b70f8	incq	%rdx
00000000000b70fb	addq	$0x4, %rax
00000000000b70ff	cmpq	%r15, %rdx
00000000000b7102	jne	0xb70e4
00000000000b7104	movl	%r13d, -0xac(%rbp)
00000000000b710b	movl	0x90(%rbx), %esi
00000000000b7111	testl	%esi, %esi
00000000000b7113	jle	0xb72c1
00000000000b7119	xorl	%r15d, %r15d
00000000000b711c	movl	$0x1, -0x9c(%rbp)
00000000000b7126	xorl	%r13d, %r13d
00000000000b7129	cmpl	$0x0, 0x94(%rbx)
00000000000b7130	jle	0xb721e
00000000000b7136	xorl	%r12d, %r12d
00000000000b7139	pxor	%xmm0, %xmm0
00000000000b713d	movq	%xmm0, -0x30(%rbp)
00000000000b7142	movq	%r14, %rdi
00000000000b7145	movl	%r13d, %esi
00000000000b7148	callq	__ZNK11PCGenMatrixIfE13checkColIndexEi ## PCGenMatrix<float>::checkColIndex(int) const
00000000000b714d	movq	%r14, %rdi
00000000000b7150	movl	%r12d, %esi
00000000000b7153	callq	__ZNK11PCGenMatrixIfE13checkRowIndexEi ## PCGenMatrix<float>::checkRowIndex(int) const
00000000000b7158	movq	0x88(%rbx), %rax
00000000000b715f	movl	0x84(%rbx), %ecx
00000000000b7165	imull	%r13d, %ecx
00000000000b7169	movl	0x80(%rbx), %edx
00000000000b716f	imull	%r12d, %edx
00000000000b7173	addl	%ecx, %edx
00000000000b7175	movslq	%edx, %rcx
00000000000b7178	movd	(%rax,%rcx,4), %xmm0
00000000000b717d	movd	%xmm0, -0x40(%rbp)
00000000000b7182	movq	%r14, %rdi
00000000000b7185	movl	%r15d, %esi
00000000000b7188	callq	__ZNK11PCGenMatrixIfE13checkColIndexEi ## PCGenMatrix<float>::checkColIndex(int) const
00000000000b718d	movq	%r14, %rdi
00000000000b7190	movl	%r12d, %esi
00000000000b7193	callq	__ZNK11PCGenMatrixIfE13checkRowIndexEi ## PCGenMatrix<float>::checkRowIndex(int) const
00000000000b7198	movq	0x88(%rbx), %rax
00000000000b719f	movl	0x84(%rbx), %ecx
00000000000b71a5	imull	%r15d, %ecx
00000000000b71a9	movl	0x80(%rbx), %edx
00000000000b71af	imull	%r12d, %edx
00000000000b71b3	addl	%ecx, %edx
00000000000b71b5	movslq	%edx, %rcx
00000000000b71b8	movss	-0x40(%rbp), %xmm0
00000000000b71bd	mulss	(%rax,%rcx,4), %xmm0
00000000000b71c2	cvtss2sd	%xmm0, %xmm0
00000000000b71c6	movq	%xmm0, %rax
00000000000b71cb	btrq	$0x3f, %rax
00000000000b71d0	movabsq	$0x7ff0000000000000, %rcx       ## imm = 0x7FF0000000000000
00000000000b71da	cmpq	%rcx, %rax
00000000000b71dd	jge	0xb7b6b
00000000000b71e3	movsd	-0x30(%rbp), %xmm1
00000000000b71e8	addsd	%xmm0, %xmm1
00000000000b71ec	movsd	%xmm1, -0x30(%rbp)
00000000000b71f1	movq	%xmm1, %rax
00000000000b71f6	btrq	$0x3f, %rax
00000000000b71fb	cmpq	%rcx, %rax
00000000000b71fe	jge	0xb7baf
00000000000b7204	incl	%r12d
00000000000b7207	cmpl	0x94(%rbx), %r12d
00000000000b720e	jl	0xb7142
00000000000b7214	xorps	%xmm0, %xmm0
00000000000b7217	cvtsd2ss	-0x30(%rbp), %xmm0
00000000000b721c	jmp	0xb7222
00000000000b721e	pxor	%xmm0, %xmm0
00000000000b7222	movss	%xmm0, -0x30(%rbp)
00000000000b7227	leaq	-0x60(%rbp), %r12
00000000000b722b	movq	%r12, %rdi
00000000000b722e	movl	%r15d, %esi
00000000000b7231	callq	__ZNK11PCGenMatrixIfE13checkColIndexEi ## PCGenMatrix<float>::checkColIndex(int) const
00000000000b7236	movq	%r12, %rdi
00000000000b7239	movl	%r13d, %esi
00000000000b723c	callq	__ZNK11PCGenMatrixIfE13checkRowIndexEi ## PCGenMatrix<float>::checkRowIndex(int) const
00000000000b7241	movq	-0x48(%rbp), %rax
00000000000b7245	movl	-0x4c(%rbp), %ecx
00000000000b7248	imull	%r15d, %ecx
00000000000b724c	movl	-0x50(%rbp), %edx
00000000000b724f	imull	%r13d, %edx
00000000000b7253	addl	%ecx, %edx
00000000000b7255	movslq	%edx, %rcx
00000000000b7258	movss	-0x30(%rbp), %xmm0
00000000000b725d	movss	%xmm0, (%rax,%rcx,4)
00000000000b7262	movq	%r12, %rdi
00000000000b7265	movl	%r13d, %esi
00000000000b7268	callq	__ZNK11PCGenMatrixIfE13checkColIndexEi ## PCGenMatrix<float>::checkColIndex(int) const
00000000000b726d	movq	%r12, %rdi
00000000000b7270	movl	%r15d, %esi
00000000000b7273	callq	__ZNK11PCGenMatrixIfE13checkRowIndexEi ## PCGenMatrix<float>::checkRowIndex(int) const
00000000000b7278	movq	-0x48(%rbp), %rax
00000000000b727c	movl	-0x4c(%rbp), %ecx
00000000000b727f	imull	%r13d, %ecx
00000000000b7283	movl	-0x50(%rbp), %edx
00000000000b7286	imull	%r15d, %edx
00000000000b728a	addl	%ecx, %edx
00000000000b728c	movslq	%edx, %rcx
00000000000b728f	movd	-0x30(%rbp), %xmm0
00000000000b7294	movd	%xmm0, (%rax,%rcx,4)
00000000000b7299	incl	%r13d
00000000000b729c	cmpl	-0x9c(%rbp), %r13d
00000000000b72a3	jne	0xb7129
00000000000b72a9	incl	%r15d
00000000000b72ac	movl	0x90(%rbx), %esi
00000000000b72b2	incl	-0x9c(%rbp)
00000000000b72b8	cmpl	%esi, %r15d
00000000000b72bb	jl	0xb7126
00000000000b72c1	pxor	%xmm0, %xmm0
00000000000b72c5	leaq	-0xd8(%rbp), %rdi
00000000000b72cc	callq	__ZN11PCGenVectorIfEC2Eif       ## PCGenVector<float>::PCGenVector(int, float)
00000000000b72d1	cmpl	$0x0, 0x94(%rbx)
00000000000b72d8	jle	0xb73c3
00000000000b72de	xorl	%r15d, %r15d
00000000000b72e1	movq	-0x110(%rbp), %rdi
00000000000b72e8	movl	%r15d, %esi
00000000000b72eb	callq	__ZN11PCGenVectorIfEclEi        ## PCGenVector<float>::operator()(int)
00000000000b72f0	xorps	%xmm0, %xmm0
00000000000b72f3	cvtss2sd	(%rax), %xmm0
00000000000b72f7	movsd	%xmm0, -0x40(%rbp)
00000000000b72fc	movq	-0xc0(%rbp), %rdi
00000000000b7303	movl	%r15d, %esi
00000000000b7306	callq	__ZN11PCGenVectorIfEclEi        ## PCGenVector<float>::operator()(int)
00000000000b730b	movl	0x90(%rbx), %ecx
00000000000b7311	testl	%ecx, %ecx
00000000000b7313	jle	0xb73b1
00000000000b7319	xorps	%xmm0, %xmm0
00000000000b731c	cvtss2sd	(%rax), %xmm0
00000000000b7320	movsd	-0x40(%rbp), %xmm1
00000000000b7325	subsd	%xmm0, %xmm1
00000000000b7329	movsd	%xmm1, -0x40(%rbp)
00000000000b732e	xorl	%r12d, %r12d
00000000000b7331	movq	%r14, %rdi
00000000000b7334	movl	%r12d, %esi
00000000000b7337	callq	__ZNK11PCGenMatrixIfE13checkColIndexEi ## PCGenMatrix<float>::checkColIndex(int) const
00000000000b733c	movq	%r14, %rdi
00000000000b733f	movl	%r15d, %esi
00000000000b7342	callq	__ZNK11PCGenMatrixIfE13checkRowIndexEi ## PCGenMatrix<float>::checkRowIndex(int) const
00000000000b7347	movq	0x88(%rbx), %rax
00000000000b734e	movl	0x84(%rbx), %ecx
00000000000b7354	imull	%r12d, %ecx
00000000000b7358	movl	0x80(%rbx), %edx
00000000000b735e	imull	%r15d, %edx
00000000000b7362	addl	%ecx, %edx
00000000000b7364	movslq	%edx, %rcx
00000000000b7367	movss	(%rax,%rcx,4), %xmm0
00000000000b736c	movss	%xmm0, -0x30(%rbp)
00000000000b7371	leaq	-0xd8(%rbp), %rdi
00000000000b7378	movl	%r12d, %esi
00000000000b737b	callq	__ZN11PCGenVectorIfEclEi        ## PCGenVector<float>::operator()(int)
00000000000b7380	xorps	%xmm0, %xmm0
00000000000b7383	cvtss2sd	-0x30(%rbp), %xmm0
00000000000b7388	xorps	%xmm1, %xmm1
00000000000b738b	cvtss2sd	(%rax), %xmm1
00000000000b738f	mulsd	-0x40(%rbp), %xmm0
00000000000b7394	addsd	%xmm0, %xmm1
00000000000b7398	xorps	%xmm0, %xmm0
00000000000b739b	cvtsd2ss	%xmm1, %xmm0
00000000000b739f	movss	%xmm0, (%rax)
00000000000b73a3	incl	%r12d
00000000000b73a6	movl	0x90(%rbx), %ecx
00000000000b73ac	cmpl	%ecx, %r12d
00000000000b73af	jl	0xb7331
00000000000b73b1	incl	%r15d
00000000000b73b4	cmpl	0x94(%rbx), %r15d
00000000000b73bb	jl	0xb72e1
00000000000b73c1	jmp	0xb73c9
00000000000b73c3	movl	0x90(%rbx), %ecx
00000000000b73c9	cmpl	$0x0, 0x60(%rbx)
00000000000b73cd	je	0xb74ed
00000000000b73d3	testl	%ecx, %ecx
00000000000b73d5	jle	0xb75ca
00000000000b73db	xorl	%r15d, %r15d
00000000000b73de	movq	-0xa8(%rbp), %rdi
00000000000b73e5	movl	%r15d, %esi
00000000000b73e8	callq	__ZN11PCGenVectorIfEclEi        ## PCGenVector<float>::operator()(int)
00000000000b73ed	movd	(%rax), %xmm0
00000000000b73f1	movd	%xmm0, -0x30(%rbp)
00000000000b73f6	leaq	-0xd8(%rbp), %rdi
00000000000b73fd	movl	%r15d, %esi
00000000000b7400	callq	__ZN11PCGenVectorIfEclEi        ## PCGenVector<float>::operator()(int)
00000000000b7405	movss	-0x30(%rbp), %xmm0
00000000000b740a	mulss	(%rax), %xmm0
00000000000b740e	movss	%xmm0, (%rax)
00000000000b7412	movl	0x90(%rbx), %ecx
00000000000b7418	testl	%ecx, %ecx
00000000000b741a	jle	0xb74e1
00000000000b7420	xorl	%r13d, %r13d
00000000000b7423	movq	-0xa8(%rbp), %rdi
00000000000b742a	movl	%r15d, %esi
00000000000b742d	callq	__ZN11PCGenVectorIfEclEi        ## PCGenVector<float>::operator()(int)
00000000000b7432	movss	(%rax), %xmm0
00000000000b7436	movss	%xmm0, -0x30(%rbp)
00000000000b743b	leaq	-0x60(%rbp), %rdi
00000000000b743f	movl	%r13d, %esi
00000000000b7442	callq	__ZNK11PCGenMatrixIfE13checkColIndexEi ## PCGenMatrix<float>::checkColIndex(int) const
00000000000b7447	leaq	-0x60(%rbp), %rdi
00000000000b744b	movl	%r15d, %esi
00000000000b744e	callq	__ZNK11PCGenMatrixIfE13checkRowIndexEi ## PCGenMatrix<float>::checkRowIndex(int) const
00000000000b7453	movq	-0x48(%rbp), %rax
00000000000b7457	movl	-0x4c(%rbp), %ecx
00000000000b745a	imull	%r13d, %ecx
00000000000b745e	movl	-0x50(%rbp), %edx
00000000000b7461	imull	%r15d, %edx
00000000000b7465	addl	%ecx, %edx
00000000000b7467	movslq	%edx, %rcx
00000000000b746a	movss	-0x30(%rbp), %xmm0
00000000000b746f	mulss	(%rax,%rcx,4), %xmm0
00000000000b7474	movss	%xmm0, (%rax,%rcx,4)
00000000000b7479	movq	-0xa8(%rbp), %rdi
00000000000b7480	movl	%r13d, %esi
00000000000b7483	callq	__ZN11PCGenVectorIfEclEi        ## PCGenVector<float>::operator()(int)
00000000000b7488	movss	(%rax), %xmm0
00000000000b748c	movss	%xmm0, -0x30(%rbp)
00000000000b7491	leaq	-0x60(%rbp), %rdi
00000000000b7495	movl	%r13d, %esi
00000000000b7498	callq	__ZNK11PCGenMatrixIfE13checkColIndexEi ## PCGenMatrix<float>::checkColIndex(int) const
00000000000b749d	leaq	-0x60(%rbp), %rdi
00000000000b74a1	movl	%r15d, %esi
00000000000b74a4	callq	__ZNK11PCGenMatrixIfE13checkRowIndexEi ## PCGenMatrix<float>::checkRowIndex(int) const
00000000000b74a9	movq	-0x48(%rbp), %rax
00000000000b74ad	movl	-0x4c(%rbp), %ecx
00000000000b74b0	imull	%r13d, %ecx
00000000000b74b4	movl	-0x50(%rbp), %edx
00000000000b74b7	imull	%r15d, %edx
00000000000b74bb	addl	%ecx, %edx
00000000000b74bd	movslq	%edx, %rcx
00000000000b74c0	movss	-0x30(%rbp), %xmm0
00000000000b74c5	mulss	(%rax,%rcx,4), %xmm0
00000000000b74ca	movss	%xmm0, (%rax,%rcx,4)
00000000000b74cf	incl	%r13d
00000000000b74d2	movl	0x90(%rbx), %ecx
00000000000b74d8	cmpl	%ecx, %r13d
00000000000b74db	jl	0xb7423
00000000000b74e1	incl	%r15d
00000000000b74e4	cmpl	%ecx, %r15d
00000000000b74e7	jl	0xb73de
00000000000b74ed	testl	%ecx, %ecx
00000000000b74ef	jle	0xb75ca
00000000000b74f5	xorps	%xmm0, %xmm0
00000000000b74f8	cvtss2sd	-0x34(%rbp), %xmm0
00000000000b74fd	addsd	0x6b02b(%rip), %xmm0
00000000000b7505	movsd	%xmm0, -0x40(%rbp)
00000000000b750a	xorl	%r15d, %r15d
00000000000b750d	leaq	-0x60(%rbp), %r12
00000000000b7511	movq	%r12, %rdi
00000000000b7514	movl	%r15d, %esi
00000000000b7517	callq	__ZNK11PCGenMatrixIfE13checkColIndexEi ## PCGenMatrix<float>::checkColIndex(int) const
00000000000b751c	movq	%r12, %rdi
00000000000b751f	movl	%r15d, %esi
00000000000b7522	callq	__ZNK11PCGenMatrixIfE13checkRowIndexEi ## PCGenMatrix<float>::checkRowIndex(int) const
00000000000b7527	movl	-0x50(%rbp), %eax
00000000000b752a	addl	-0x4c(%rbp), %eax
00000000000b752d	movq	-0x48(%rbp), %rcx
00000000000b7531	imull	%r15d, %eax
00000000000b7535	cltq
00000000000b7537	movss	(%rcx,%rax,4), %xmm0
00000000000b753c	movss	%xmm0, -0x30(%rbp)
00000000000b7541	movq	%r12, %rdi
00000000000b7544	movl	%r15d, %esi
00000000000b7547	callq	__ZNK11PCGenMatrixIfE13checkColIndexEi ## PCGenMatrix<float>::checkColIndex(int) const
00000000000b754c	movq	%r12, %rdi
00000000000b754f	movl	%r15d, %esi
00000000000b7552	callq	__ZNK11PCGenMatrixIfE13checkRowIndexEi ## PCGenMatrix<float>::checkRowIndex(int) const
00000000000b7557	movq	-0x48(%rbp), %rax
00000000000b755b	movl	-0x50(%rbp), %ecx
00000000000b755e	addl	-0x4c(%rbp), %ecx
00000000000b7561	imull	%r15d, %ecx
00000000000b7565	movslq	%ecx, %rcx
00000000000b7568	xorps	%xmm0, %xmm0
00000000000b756b	cvtss2sd	-0x30(%rbp), %xmm0
00000000000b7570	mulsd	-0x40(%rbp), %xmm0
00000000000b7575	cvtsd2ss	%xmm0, %xmm0
00000000000b7579	movss	%xmm0, (%rax,%rcx,4)
00000000000b757e	movq	%r12, %rdi
00000000000b7581	movl	%r15d, %esi
00000000000b7584	callq	__ZNK11PCGenMatrixIfE13checkColIndexEi ## PCGenMatrix<float>::checkColIndex(int) const
00000000000b7589	movq	%r12, %rdi
00000000000b758c	movl	%r15d, %esi
00000000000b758f	callq	__ZNK11PCGenMatrixIfE13checkRowIndexEi ## PCGenMatrix<float>::checkRowIndex(int) const
00000000000b7594	movq	-0x48(%rbp), %rax
00000000000b7598	movl	-0x50(%rbp), %ecx
00000000000b759b	addl	-0x4c(%rbp), %ecx
00000000000b759e	imull	%r15d, %ecx
00000000000b75a2	movslq	%ecx, %rcx
00000000000b75a5	movl	(%rax,%rcx,4), %eax
00000000000b75a8	movl	$0x7fffffff, %ecx               ## imm = 0x7FFFFFFF
00000000000b75ad	andl	%ecx, %eax
00000000000b75af	cmpl	$0x7f800000, %eax               ## imm = 0x7F800000
00000000000b75b4	jge	0xb7bf0
00000000000b75ba	incl	%r15d
00000000000b75bd	cmpl	0x90(%rbx), %r15d
00000000000b75c4	jl	0xb750d
00000000000b75ca	leaq	-0x80(%rbp), %rdi
00000000000b75ce	leaq	-0x60(%rbp), %rsi
00000000000b75d2	callq	__Z7inverseRK11PCGenMatrixIfE   ## inverse(PCGenMatrix<float> const&)
00000000000b75d7	movl	-0x78(%rbp), %r15d
00000000000b75db	leaq	-0x98(%rbp), %rdi
00000000000b75e2	movl	%r15d, %esi
00000000000b75e5	callq	__ZN13PCGenBlockRefIfEC2Ei      ## PCGenBlockRef<float>::PCGenBlockRef(int)
00000000000b75ea	movl	%r15d, -0x90(%rbp)
00000000000b75f1	movl	$0x1, -0x8c(%rbp)
00000000000b75fb	movq	-0x98(%rbp), %rax
00000000000b7602	movq	%rax, -0x30(%rbp)
00000000000b7606	movq	%rax, -0x88(%rbp)
00000000000b760d	movslq	-0x78(%rbp), %rax
00000000000b7611	movq	%rax, -0x40(%rbp)
00000000000b7615	testq	%rax, %rax
00000000000b7618	jle	0xb7723
00000000000b761e	movl	-0x74(%rbp), %ecx
00000000000b7621	movq	-0x68(%rbp), %rsi
00000000000b7625	movq	-0xc8(%rbp), %rax
00000000000b762c	movslq	-0xcc(%rbp), %r8
00000000000b7633	movslq	-0x6c(%rbp), %r9
00000000000b7637	movslq	-0x70(%rbp), %r10
00000000000b763b	movq	%r8, %r11
00000000000b763e	shlq	$0x2, %r11
00000000000b7642	shlq	$0x2, %r10
00000000000b7646	movq	%r9, %r15
00000000000b7649	shlq	$0x2, %r15
00000000000b764d	xorl	%r12d, %r12d
00000000000b7650	cmpl	$0x1, %r9d
00000000000b7654	jne	0xb7685
00000000000b7656	cmpl	$0x1, %r8d
00000000000b765a	jne	0xb76b2
00000000000b765c	testq	%rcx, %rcx
00000000000b765f	je	0xb7705
00000000000b7665	pxor	%xmm0, %xmm0
00000000000b7669	xorl	%edx, %edx
00000000000b766b	movss	(%rsi,%rdx,4), %xmm1
00000000000b7670	mulss	(%rax,%rdx,4), %xmm1
00000000000b7675	addss	%xmm1, %xmm0
00000000000b7679	incq	%rdx
00000000000b767c	cmpl	%edx, %ecx
00000000000b767e	jne	0xb766b
00000000000b7680	jmp	0xb7709
00000000000b7685	cmpl	$0x1, %r8d
00000000000b7689	jne	0xb76d9
00000000000b768b	testl	%ecx, %ecx
00000000000b768d	jle	0xb7705
00000000000b768f	pxor	%xmm0, %xmm0
00000000000b7693	movq	%rsi, %rdx
00000000000b7696	xorl	%edi, %edi
00000000000b7698	movss	(%rdx), %xmm1
00000000000b769c	mulss	(%rax,%rdi,4), %xmm1
00000000000b76a1	addss	%xmm1, %xmm0
00000000000b76a5	incq	%rdi
00000000000b76a8	addq	%r15, %rdx
00000000000b76ab	cmpq	%rdi, %rcx
00000000000b76ae	jne	0xb7698
00000000000b76b0	jmp	0xb7709
00000000000b76b2	testl	%ecx, %ecx
00000000000b76b4	jle	0xb7705
00000000000b76b6	pxor	%xmm0, %xmm0
00000000000b76ba	movq	%rax, %rdx
00000000000b76bd	xorl	%edi, %edi
00000000000b76bf	movss	(%rsi,%rdi,4), %xmm1
00000000000b76c4	mulss	(%rdx), %xmm1
00000000000b76c8	addss	%xmm1, %xmm0
00000000000b76cc	incq	%rdi
00000000000b76cf	addq	%r11, %rdx
00000000000b76d2	cmpq	%rdi, %rcx
00000000000b76d5	jne	0xb76bf
00000000000b76d7	jmp	0xb7709
00000000000b76d9	testl	%ecx, %ecx
00000000000b76db	jle	0xb7705
00000000000b76dd	pxor	%xmm0, %xmm0
00000000000b76e1	movq	%rsi, %r13
00000000000b76e4	movq	%rax, %rdi
00000000000b76e7	movq	%rcx, %rdx
00000000000b76ea	movss	(%r13), %xmm1
00000000000b76f0	mulss	(%rdi), %xmm1
00000000000b76f4	addss	%xmm1, %xmm0
00000000000b76f8	addq	%r11, %rdi
00000000000b76fb	addq	%r15, %r13
00000000000b76fe	decq	%rdx
00000000000b7701	jne	0xb76ea
00000000000b7703	jmp	0xb7709
00000000000b7705	pxor	%xmm0, %xmm0
00000000000b7709	movq	-0x30(%rbp), %rdx
00000000000b770d	movss	%xmm0, (%rdx,%r12,4)
00000000000b7713	incq	%r12
00000000000b7716	addq	%r10, %rsi
00000000000b7719	cmpq	-0x40(%rbp), %r12
00000000000b771d	jne	0xb7650
00000000000b7723	movq	-0x80(%rbp), %rdi
00000000000b7727	testq	%rdi, %rdi
00000000000b772a	je	0xb773a
00000000000b772c	decl	-0x4(%rdi)
00000000000b772f	jne	0xb773a
00000000000b7731	addq	$-0x8, %rdi
00000000000b7735	callq	0xde6ba                         ## symbol stub for: __ZdaPv
00000000000b773a	cmpl	$0x0, 0x60(%rbx)
00000000000b773e	leaq	-0xf0(%rbp), %r12
00000000000b7745	je	0xb78c3
00000000000b774b	movl	-0x90(%rbp), %esi
00000000000b7751	movl	-0x8c(%rbp), %edx
00000000000b7757	movq	-0x88(%rbp), %rdi
00000000000b775e	cmpl	$0x1, %edx
00000000000b7761	jne	0xb776a
00000000000b7763	callq	__Z13_vector_norm2IKfET_PS1_i   ## float const _vector_norm2<float const>(float const*, int)
00000000000b7768	jmp	0xb776f
00000000000b776a	callq	__Z13_vector_norm2IKfET_PS1_ii  ## float const _vector_norm2<float const>(float const*, int, int)
00000000000b776f	ucomiss	0x2a7fa(%rip), %xmm0
00000000000b7776	movslq	-0x8c(%rbp), %rsi
00000000000b777d	movl	-0x90(%rbp), %eax
00000000000b7783	jbe	0xb77c8
00000000000b7785	sqrtss	%xmm0, %xmm0
00000000000b7789	movq	-0x88(%rbp), %rcx
00000000000b7790	cmpl	$0x1, %esi
00000000000b7793	jne	0xb7811
00000000000b7795	testl	%eax, %eax
00000000000b7797	jle	0xb78c3
00000000000b779d	xorl	%edx, %edx
00000000000b779f	movss	(%rcx,%rdx,4), %xmm1
00000000000b77a4	divss	%xmm0, %xmm1
00000000000b77a8	movss	%xmm1, (%rcx,%rdx,4)
00000000000b77ad	incq	%rdx
00000000000b77b0	cmpq	%rdx, %rax
00000000000b77b3	jne	0xb779f
00000000000b77b5	movq	-0x88(%rbp), %rcx
00000000000b77bc	movq	0x68(%rbx), %rdx
00000000000b77c0	movl	0x64(%rbx), %edi
00000000000b77c3	movb	$0x1, %r8b
00000000000b77c6	jmp	0xb77e1
00000000000b77c8	movq	-0x88(%rbp), %rcx
00000000000b77cf	movq	0x68(%rbx), %rdx
00000000000b77d3	movl	0x64(%rbx), %edi
00000000000b77d6	testl	%eax, %eax
00000000000b77d8	setg	%r8b
00000000000b77dc	cmpl	$0x1, %esi
00000000000b77df	jne	0xb7849
00000000000b77e1	cmpl	$0x1, %edi
00000000000b77e4	jne	0xb7873
00000000000b77ea	testb	%r8b, %r8b
00000000000b77ed	je	0xb78c3
00000000000b77f3	xorl	%esi, %esi
00000000000b77f5	movss	(%rdx,%rsi,4), %xmm0
00000000000b77fa	mulss	(%rcx,%rsi,4), %xmm0
00000000000b77ff	movss	%xmm0, (%rcx,%rsi,4)
00000000000b7804	incq	%rsi
00000000000b7807	cmpq	%rsi, %rax
00000000000b780a	jne	0xb77f5
00000000000b780c	jmp	0xb78c3
00000000000b7811	testl	%eax, %eax
00000000000b7813	jle	0xb78c3
00000000000b7819	leaq	(,%rsi,4), %rdx
00000000000b7821	movq	%rax, %rdi
00000000000b7824	movss	(%rcx), %xmm1
00000000000b7828	divss	%xmm0, %xmm1
00000000000b782c	movss	%xmm1, (%rcx)
00000000000b7830	addq	%rdx, %rcx
00000000000b7833	decq	%rdi
00000000000b7836	jne	0xb7824
00000000000b7838	movq	-0x88(%rbp), %rcx
00000000000b783f	movq	0x68(%rbx), %rdx
00000000000b7843	movl	0x64(%rbx), %edi
00000000000b7846	movb	$0x1, %r8b
00000000000b7849	cmpl	$0x1, %edi
00000000000b784c	jne	0xb789c
00000000000b784e	testb	%r8b, %r8b
00000000000b7851	je	0xb78c3
00000000000b7853	shlq	$0x2, %rsi
00000000000b7857	xorl	%edi, %edi
00000000000b7859	movss	(%rdx,%rdi,4), %xmm0
00000000000b785e	mulss	(%rcx), %xmm0
00000000000b7862	movss	%xmm0, (%rcx)
00000000000b7866	incq	%rdi
00000000000b7869	addq	%rsi, %rcx
00000000000b786c	cmpq	%rdi, %rax
00000000000b786f	jne	0xb7859
00000000000b7871	jmp	0xb78c3
00000000000b7873	testb	%r8b, %r8b
00000000000b7876	je	0xb78c3
00000000000b7878	movslq	%edi, %rsi
00000000000b787b	shlq	$0x2, %rsi
00000000000b787f	xorl	%edi, %edi
00000000000b7881	movss	(%rdx), %xmm0
00000000000b7885	mulss	(%rcx,%rdi,4), %xmm0
00000000000b788a	movss	%xmm0, (%rcx,%rdi,4)
00000000000b788f	incq	%rdi
00000000000b7892	addq	%rsi, %rdx
00000000000b7895	cmpq	%rdi, %rax
00000000000b7898	jne	0xb7881
00000000000b789a	jmp	0xb78c3
00000000000b789c	testb	%r8b, %r8b
00000000000b789f	je	0xb78c3
00000000000b78a1	movslq	%edi, %rdi
00000000000b78a4	shlq	$0x2, %rdi
00000000000b78a8	shlq	$0x2, %rsi
00000000000b78ac	movss	(%rdx), %xmm0
00000000000b78b0	mulss	(%rcx), %xmm0
00000000000b78b4	movss	%xmm0, (%rcx)
00000000000b78b8	addq	%rdi, %rdx
00000000000b78bb	addq	%rsi, %rcx
00000000000b78be	decq	%rax
00000000000b78c1	jne	0xb78ac
00000000000b78c3	movl	0x18(%rbx), %r15d
00000000000b78c7	leaq	-0x80(%rbp), %rdi
00000000000b78cb	movl	%r15d, %esi
00000000000b78ce	callq	__ZN13PCGenBlockRefIfEC2Ei      ## PCGenBlockRef<float>::PCGenBlockRef(int)
00000000000b78d3	movl	%r15d, -0x78(%rbp)
00000000000b78d7	movl	$0x1, -0x74(%rbp)
00000000000b78de	movq	-0x80(%rbp), %rsi
00000000000b78e2	movq	%rsi, -0x70(%rbp)
00000000000b78e6	movl	0x18(%rbx), %eax
00000000000b78e9	movq	0x20(%rbx), %rcx
00000000000b78ed	movslq	0x1c(%rbx), %rdi
00000000000b78f1	movq	-0x88(%rbp), %rdx
00000000000b78f8	movslq	-0x8c(%rbp), %r8
00000000000b78ff	movl	%edi, %r9d
00000000000b7902	xorl	$0x1, %r9d
00000000000b7906	movl	%r8d, %r10d
00000000000b7909	xorl	$0x1, %r10d
00000000000b790d	orl	%r9d, %r10d
00000000000b7910	jne	0xb7931
00000000000b7912	testl	%eax, %eax
00000000000b7914	jle	0xb795c
00000000000b7916	xorl	%edi, %edi
00000000000b7918	movss	(%rcx,%rdi,4), %xmm0
00000000000b791d	addss	(%rdx,%rdi,4), %xmm0
00000000000b7922	movss	%xmm0, (%rsi,%rdi,4)
00000000000b7927	incq	%rdi
00000000000b792a	cmpq	%rdi, %rax
00000000000b792d	jne	0xb7918
00000000000b792f	jmp	0xb795c
00000000000b7931	testl	%eax, %eax
00000000000b7933	jle	0xb795c
00000000000b7935	shlq	$0x2, %r8
00000000000b7939	shlq	$0x2, %rdi
00000000000b793d	xorl	%r9d, %r9d
00000000000b7940	movss	(%rcx), %xmm0
00000000000b7944	addss	(%rdx), %xmm0
00000000000b7948	movss	%xmm0, (%rsi,%r9,4)
00000000000b794e	incq	%r9
00000000000b7951	addq	%r8, %rdx
00000000000b7954	addq	%rdi, %rcx
00000000000b7957	cmpq	%r9, %rax
00000000000b795a	jne	0xb7940
00000000000b795c	movl	%r15d, -0xe8(%rbp)
00000000000b7963	movl	$0x1, -0xe4(%rbp)
00000000000b796d	movq	%r12, %rdi
00000000000b7970	callq	__ZN13PCGenBlockRefIPcE6assignEPS0_ ## PCGenBlockRef<char*>::assign(char**)
00000000000b7975	movq	-0x80(%rbp), %rdi
00000000000b7979	movq	-0x70(%rbp), %rax
00000000000b797d	movq	%rax, -0xe0(%rbp)
00000000000b7984	testq	%rdi, %rdi
00000000000b7987	leaq	-0x128(%rbp), %r15
00000000000b798e	je	0xb799e
00000000000b7990	decl	-0x4(%rdi)
00000000000b7993	jne	0xb799e
00000000000b7995	addq	$-0x8, %rdi
00000000000b7999	callq	0xde6ba                         ## symbol stub for: __ZdaPv
00000000000b799e	movq	0x8(%rbx), %rdi
00000000000b79a2	movq	(%rdi), %rax
00000000000b79a5	movq	%r12, %rsi
00000000000b79a8	callq	*0x10(%rax)
00000000000b79ab	movq	0x8(%rbx), %rdi
00000000000b79af	movq	(%rdi), %rax
00000000000b79b2	movq	%r15, %rsi
00000000000b79b5	callq	*0x18(%rax)
00000000000b79b8	movq	%rbx, %rdi
00000000000b79bb	movq	%r15, %rsi
00000000000b79be	callq	__ZN10PCLMSolver14computeEpsilonERK11PCGenVectorIfE ## PCLMSolver::computeEpsilon(PCGenVector<float> const&)
00000000000b79c3	movss	0xa4(%rbx), %xmm4
00000000000b79cb	movaps	-0x100(%rbp), %xmm3
00000000000b79d2	movaps	%xmm3, %xmm1
00000000000b79d5	subss	%xmm0, %xmm1
00000000000b79d9	movaps	%xmm3, %xmm2
00000000000b79dc	andps	0x2a1cd(%rip), %xmm2
00000000000b79e3	addss	0x2a585(%rip), %xmm2
00000000000b79eb	divss	%xmm2, %xmm1
00000000000b79ef	xorl	%r15d, %r15d
00000000000b79f2	ucomiss	%xmm1, %xmm4
00000000000b79f5	jb	0xb7a15
00000000000b79f7	movq	-0x108(%rbp), %r15
00000000000b79fe	incl	%r15d
00000000000b7a01	cmpl	0x98(%rbx), %r15d
00000000000b7a08	jge	0xb7ab0
00000000000b7a0e	movaps	-0x100(%rbp), %xmm3
00000000000b7a15	movss	%xmm0, -0x30(%rbp)
00000000000b7a1a	ucomiss	%xmm0, %xmm3
00000000000b7a1d	jbe	0xb7a69
00000000000b7a1f	movq	-0xb8(%rbp), %rdi
00000000000b7a26	movq	%r12, %rsi
00000000000b7a29	callq	__ZN11PCGenVectorIfE3setIfEERS0_RKS_IT_E ## PCGenVector<float>& PCGenVector<float>::set<float>(PCGenVector<float> const&)
00000000000b7a2e	movq	-0xc0(%rbp), %rdi
00000000000b7a35	leaq	-0x128(%rbp), %rsi
00000000000b7a3c	callq	__ZN11PCGenVectorIfE3setIfEERS0_RKS_IT_E ## PCGenVector<float>& PCGenVector<float>::set<float>(PCGenVector<float> const&)
00000000000b7a41	movss	-0x34(%rbp), %xmm0
00000000000b7a46	divss	0x6dd3e(%rip), %xmm0
00000000000b7a4e	movss	%xmm0, -0x34(%rbp)
00000000000b7a53	movb	$0x1, %r13b
00000000000b7a56	xorl	%r12d, %r12d
00000000000b7a59	movss	-0x30(%rbp), %xmm0
00000000000b7a5e	movaps	%xmm0, -0x100(%rbp)
00000000000b7a65	movb	$0x1, %cl
00000000000b7a67	jmp	0xb7ab8
00000000000b7a69	xorps	%xmm0, %xmm0
00000000000b7a6c	cvtss2sd	-0x34(%rbp), %xmm0
00000000000b7a71	mulsd	0x6bb27(%rip), %xmm0
00000000000b7a79	cvtsd2ss	%xmm0, %xmm0
00000000000b7a7d	movss	%xmm0, -0x34(%rbp)
00000000000b7a82	cvtss2sd	%xmm0, %xmm0
00000000000b7a86	xorl	%ecx, %ecx
00000000000b7a88	movsd	0x6ae10(%rip), %xmm1
00000000000b7a90	ucomisd	%xmm0, %xmm1
00000000000b7a94	movl	%r15d, %eax
00000000000b7a97	cmoval	%ecx, %eax
00000000000b7a9a	cmpb	$0x0, 0xa8(%rbx)
00000000000b7aa1	cmovel	%r15d, %eax
00000000000b7aa5	movq	%rax, %r15
00000000000b7aa8	movb	$0x1, %r13b
00000000000b7aab	movb	$0x1, %r12b
00000000000b7aae	jmp	0xb7ab8
00000000000b7ab0	movb	$0x1, %r12b
00000000000b7ab3	xorl	%r13d, %r13d
00000000000b7ab6	xorl	%ecx, %ecx
00000000000b7ab8	movq	-0x98(%rbp), %rdi
00000000000b7abf	testq	%rdi, %rdi
00000000000b7ac2	je	0xb7ad8
00000000000b7ac4	decl	-0x4(%rdi)
00000000000b7ac7	jne	0xb7ad8
00000000000b7ac9	addq	$-0x8, %rdi
00000000000b7acd	movl	%ecx, -0x30(%rbp)
00000000000b7ad0	callq	0xde6ba                         ## symbol stub for: __ZdaPv
00000000000b7ad5	movl	-0x30(%rbp), %ecx
00000000000b7ad8	movq	-0xd8(%rbp), %rdi
00000000000b7adf	testq	%rdi, %rdi
00000000000b7ae2	je	0xb7af8
00000000000b7ae4	decl	-0x4(%rdi)
00000000000b7ae7	jne	0xb7af8
00000000000b7ae9	addq	$-0x8, %rdi
00000000000b7aed	movl	%ecx, -0x30(%rbp)
00000000000b7af0	callq	0xde6ba                         ## symbol stub for: __ZdaPv
00000000000b7af5	movl	-0x30(%rbp), %ecx
00000000000b7af8	movq	-0x60(%rbp), %rdi
00000000000b7afc	testq	%rdi, %rdi
00000000000b7aff	je	0xb7b15
00000000000b7b01	decl	-0x4(%rdi)
00000000000b7b04	jne	0xb7b15
00000000000b7b06	addq	$-0x8, %rdi
00000000000b7b0a	movl	%ecx, -0x30(%rbp)
00000000000b7b0d	callq	0xde6ba                         ## symbol stub for: __ZdaPv
00000000000b7b12	movl	-0x30(%rbp), %ecx
00000000000b7b15	testb	%r13b, %r13b
00000000000b7b18	movl	-0xac(%rbp), %r13d
00000000000b7b1f	jne	0xb705c
00000000000b7b25	movq	-0x128(%rbp), %rdi
00000000000b7b2c	testq	%rdi, %rdi
00000000000b7b2f	je	0xb7b3f
00000000000b7b31	decl	-0x4(%rdi)
00000000000b7b34	jne	0xb7b3f
00000000000b7b36	addq	$-0x8, %rdi
00000000000b7b3a	callq	0xde6ba                         ## symbol stub for: __ZdaPv
00000000000b7b3f	movq	-0xf0(%rbp), %rdi
00000000000b7b46	testq	%rdi, %rdi
00000000000b7b49	je	0xb7b59
00000000000b7b4b	decl	-0x4(%rdi)
00000000000b7b4e	jne	0xb7b59
00000000000b7b50	addq	$-0x8, %rdi
00000000000b7b54	callq	0xde6ba                         ## symbol stub for: __ZdaPv
00000000000b7b59	addq	$0x108, %rsp                    ## imm = 0x108
00000000000b7b60	popq	%rbx
00000000000b7b61	popq	%r12
00000000000b7b63	popq	%r13
00000000000b7b65	popq	%r14
00000000000b7b67	popq	%r15
00000000000b7b69	popq	%rbp
00000000000b7b6a	retq
00000000000b7b6b	movl	$0x40, %edi
00000000000b7b70	callq	0xde6de                         ## symbol stub for: ___cxa_allocate_exception
00000000000b7b75	movq	%rax, %r14
00000000000b7b78	leaq	0x7b1dd(%rip), %rsi             ## literal pool for: "nan"
00000000000b7b7f	leaq	-0x80(%rbp), %rdi
00000000000b7b83	callq	__ZN8PCStringC1EPKc             ## PCString::PCString(char const*)
00000000000b7b88	leaq	-0x80(%rbp), %rsi
00000000000b7b8c	movq	%r14, %rdi
00000000000b7b8f	callq	__ZN11PCExceptionC2ERK8PCString ## PCException::PCException(PCString const&)
00000000000b7b94	leaq	__ZTI11PCException(%rip), %rsi  ## typeinfo for PCException
00000000000b7b9b	leaq	__ZN11PCExceptionD1Ev(%rip), %rdx ## PCException::~PCException()
00000000000b7ba2	movq	%r14, %rdi
00000000000b7ba5	callq	0xde71a                         ## symbol stub for: ___cxa_throw
00000000000b7baa	jmp	0xb7c2f
00000000000b7baf	movl	$0x40, %edi
00000000000b7bb4	callq	0xde6de                         ## symbol stub for: ___cxa_allocate_exception
00000000000b7bb9	movq	%rax, %r14
00000000000b7bbc	leaq	0x7b199(%rip), %rsi             ## literal pool for: "nan"
00000000000b7bc3	leaq	-0x80(%rbp), %rdi
00000000000b7bc7	callq	__ZN8PCStringC1EPKc             ## PCString::PCString(char const*)
00000000000b7bcc	leaq	-0x80(%rbp), %rsi
00000000000b7bd0	movq	%r14, %rdi
00000000000b7bd3	callq	__ZN11PCExceptionC2ERK8PCString ## PCException::PCException(PCString const&)
00000000000b7bd8	leaq	__ZTI11PCException(%rip), %rsi  ## typeinfo for PCException
00000000000b7bdf	leaq	__ZN11PCExceptionD1Ev(%rip), %rdx ## PCException::~PCException()
00000000000b7be6	movq	%r14, %rdi
00000000000b7be9	callq	0xde71a                         ## symbol stub for: ___cxa_throw
00000000000b7bee	jmp	0xb7c2f
00000000000b7bf0	movl	$0x40, %edi
00000000000b7bf5	callq	0xde6de                         ## symbol stub for: ___cxa_allocate_exception
00000000000b7bfa	movq	%rax, %r14
00000000000b7bfd	leaq	0x7b158(%rip), %rsi             ## literal pool for: "nan"
00000000000b7c04	leaq	-0x80(%rbp), %rdi
00000000000b7c08	callq	__ZN8PCStringC1EPKc             ## PCString::PCString(char const*)
00000000000b7c0d	leaq	-0x80(%rbp), %rsi
00000000000b7c11	movq	%r14, %rdi
00000000000b7c14	callq	__ZN11PCExceptionC2ERK8PCString ## PCException::PCException(PCString const&)
00000000000b7c19	leaq	__ZTI11PCException(%rip), %rsi  ## typeinfo for PCException
00000000000b7c20	leaq	__ZN11PCExceptionD1Ev(%rip), %rdx ## PCException::~PCException()
00000000000b7c27	movq	%r14, %rdi
00000000000b7c2a	callq	0xde71a                         ## symbol stub for: ___cxa_throw
00000000000b7c2f	ud2
00000000000b7c31	jmp	0xb7c72
00000000000b7c33	jmp	0xb7c72
00000000000b7c35	jmp	0xb7c6a
00000000000b7c37	movq	%rax, %rbx
00000000000b7c3a	movq	-0x80(%rbp), %rdi
00000000000b7c3e	jmp	0xb7c7c
00000000000b7c40	jmp	0xb7cc6
00000000000b7c45	movq	%rax, %rbx
00000000000b7c48	movq	-0x80(%rbp), %rdi
00000000000b7c4c	testq	%rdi, %rdi
00000000000b7c4f	je	0xb7c75
00000000000b7c51	decl	-0x4(%rdi)
00000000000b7c54	jne	0xb7c75
00000000000b7c56	addq	$-0x8, %rdi
00000000000b7c5a	callq	0xde6ba                         ## symbol stub for: __ZdaPv
00000000000b7c5f	jmp	0xb7c75
00000000000b7c61	jmp	0xb7c72
00000000000b7c63	jmp	0xb7c72
00000000000b7c65	jmp	0xb7d16
00000000000b7c6a	movq	%rax, %rbx
00000000000b7c6d	jmp	0xb7d30
00000000000b7c72	movq	%rax, %rbx
00000000000b7c75	movq	-0x98(%rbp), %rdi
00000000000b7c7c	testq	%rdi, %rdi
00000000000b7c7f	je	0xb7cc9
00000000000b7c81	decl	-0x4(%rdi)
00000000000b7c84	jne	0xb7cc9
00000000000b7c86	addq	$-0x8, %rdi
00000000000b7c8a	callq	0xde6ba                         ## symbol stub for: __ZdaPv
00000000000b7c8f	jmp	0xb7cc9
00000000000b7c91	movq	%rax, %rbx
00000000000b7c94	leaq	-0x80(%rbp), %rdi
00000000000b7c98	callq	__ZN8PCStringD1Ev               ## PCString::~PCString()
00000000000b7c9d	jmp	0xb7cc9
00000000000b7c9f	movq	%rax, %rbx
00000000000b7ca2	leaq	-0x80(%rbp), %rdi
00000000000b7ca6	callq	__ZN8PCStringD1Ev               ## PCString::~PCString()
00000000000b7cab	jmp	0xb7cb0
00000000000b7cad	movq	%rax, %rbx
00000000000b7cb0	movq	%r14, %rdi
00000000000b7cb3	callq	0xde6fc                         ## symbol stub for: ___cxa_free_exception
00000000000b7cb8	jmp	0xb7cc9
00000000000b7cba	jmp	0xb7cc6
00000000000b7cbc	jmp	0xb7cc6
00000000000b7cbe	jmp	0xb7cc6
00000000000b7cc0	jmp	0xb7cc6
00000000000b7cc2	jmp	0xb7cc6
00000000000b7cc4	jmp	0xb7cc6
00000000000b7cc6	movq	%rax, %rbx
00000000000b7cc9	movq	-0xd8(%rbp), %rdi
00000000000b7cd0	testq	%rdi, %rdi
00000000000b7cd3	je	0xb7d19
00000000000b7cd5	decl	-0x4(%rdi)
00000000000b7cd8	jne	0xb7d19
00000000000b7cda	addq	$-0x8, %rdi
00000000000b7cde	callq	0xde6ba                         ## symbol stub for: __ZdaPv
00000000000b7ce3	jmp	0xb7d19
00000000000b7ce5	jmp	0xb7d16
00000000000b7ce7	jmp	0xb7ce9
00000000000b7ce9	movq	%rax, %rbx
00000000000b7cec	leaq	-0x80(%rbp), %rdi
00000000000b7cf0	callq	__ZN8PCStringD1Ev               ## PCString::~PCString()
00000000000b7cf5	jmp	0xb7d19
00000000000b7cf7	jmp	0xb7cf9
00000000000b7cf9	movq	%rax, %rbx
00000000000b7cfc	leaq	-0x80(%rbp), %rdi
00000000000b7d00	callq	__ZN8PCStringD1Ev               ## PCString::~PCString()
00000000000b7d05	jmp	0xb7d0c
00000000000b7d07	jmp	0xb7d09
00000000000b7d09	movq	%rax, %rbx
00000000000b7d0c	movq	%r14, %rdi
00000000000b7d0f	callq	0xde6fc                         ## symbol stub for: ___cxa_free_exception
00000000000b7d14	jmp	0xb7d19
00000000000b7d16	movq	%rax, %rbx
00000000000b7d19	movq	-0x60(%rbp), %rdi
00000000000b7d1d	testq	%rdi, %rdi
00000000000b7d20	je	0xb7d30
00000000000b7d22	decl	-0x4(%rdi)
00000000000b7d25	jne	0xb7d30
00000000000b7d27	addq	$-0x8, %rdi
00000000000b7d2b	callq	0xde6ba                         ## symbol stub for: __ZdaPv
00000000000b7d30	movq	-0x128(%rbp), %rdi
00000000000b7d37	testq	%rdi, %rdi
00000000000b7d3a	je	0xb7d4a
00000000000b7d3c	decl	-0x4(%rdi)
00000000000b7d3f	jne	0xb7d4a
00000000000b7d41	addq	$-0x8, %rdi
00000000000b7d45	callq	0xde6ba                         ## symbol stub for: __ZdaPv
00000000000b7d4a	movq	-0xf0(%rbp), %rdi
00000000000b7d51	testq	%rdi, %rdi
00000000000b7d54	je	0xb7d64
00000000000b7d56	decl	-0x4(%rdi)
00000000000b7d59	jne	0xb7d64
00000000000b7d5b	addq	$-0x8, %rdi
00000000000b7d5f	callq	0xde6ba                         ## symbol stub for: __ZdaPv
00000000000b7d64	movq	%rbx, %rdi
00000000000b7d67	callq	0xde50a                         ## symbol stub for: __Unwind_Resume
