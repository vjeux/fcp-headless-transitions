__ZN42HgcApply3DLUTTetrahedralUniform_basekernel10RenderTileEP6HGTile:
0000000000399f60	pushq	%rbp
0000000000399f61	movq	%rsp, %rbp
0000000000399f64	pushq	%r15
0000000000399f66	pushq	%r14
0000000000399f68	pushq	%r13
0000000000399f6a	pushq	%r12
0000000000399f6c	pushq	%rbx
0000000000399f6d	subq	$0x108, %rsp                    ## imm = 0x108
0000000000399f74	movq	%rsi, %rbx
0000000000399f77	movq	%rdi, %r14
0000000000399f7a	movq	%rsi, %rdi
0000000000399f7d	callq	__ZNK6HGTile8RendererEv         ## HGTile::Renderer() const
0000000000399f82	movq	%rax, %rdi
0000000000399f85	xorl	%esi, %esi
0000000000399f87	callq	__ZN10HGRenderer9GetTargetEj    ## HGRenderer::GetTarget(unsigned int)
0000000000399f8c	cmpl	$0x4700000, %eax                ## imm = 0x4700000
0000000000399f91	jb	0x399fb2
0000000000399f93	movq	%r14, %rdi
0000000000399f96	movq	%rbx, %rsi
0000000000399f99	callq	__ZN42HgcApply3DLUTTetrahedralUniform_basekernel14RenderTile_AVXEP6HGTile ## HgcApply3DLUTTetrahedralUniform_basekernel::RenderTile_AVX(HGTile*)
0000000000399f9e	xorl	%eax, %eax
0000000000399fa0	addq	$0x108, %rsp                    ## imm = 0x108
0000000000399fa7	popq	%rbx
0000000000399fa8	popq	%r12
0000000000399faa	popq	%r13
0000000000399fac	popq	%r14
0000000000399fae	popq	%r15
0000000000399fb0	popq	%rbp
0000000000399fb1	retq
0000000000399fb2	movaps	(%rbx), %xmm0
0000000000399fb5	cvtdq2ps	%xmm0, %xmm2
0000000000399fb8	mulps	0x300f1(%rip), %xmm2
0000000000399fbf	addps	0x300fa(%rip), %xmm2
0000000000399fc6	pshufd	$0xee, %xmm0, %xmm1             ## xmm1 = xmm0[2,3,2,3]
0000000000399fcb	psubd	%xmm0, %xmm1
0000000000399fcf	movd	%xmm1, %ecx
0000000000399fd3	pextrd	$0x1, %xmm1, %edx
0000000000399fd9	movslq	0x58(%rbx), %rsi
0000000000399fdd	movq	%rsi, -0x50(%rbp)
0000000000399fe1	movq	0x50(%rbx), %rsi
0000000000399fe5	movq	0x10(%rbx), %rdi
0000000000399fe9	movslq	0x18(%rbx), %r8
0000000000399fed	movq	%r8, -0x48(%rbp)
0000000000399ff1	cmpl	$0x44fffff, %eax                ## imm = 0x44FFFFF
0000000000399ff6	movaps	%xmm2, -0x40(%rbp)
0000000000399ffa	movl	%edx, -0x2c(%rbp)
0000000000399ffd	jbe	0x39a533
000000000039a003	testl	%edx, %edx
000000000039a005	jle	0x399f9e
000000000039a007	testl	%ecx, %ecx
000000000039a009	jle	0x399f9e
000000000039a00b	movl	%ecx, %eax
000000000039a00d	shlq	$0x4, -0x50(%rbp)
000000000039a012	shlq	$0x4, -0x48(%rbp)
000000000039a017	shlq	$0x4, %rax
000000000039a01b	xorl	%ecx, %ecx
000000000039a01d	movaps	0x2dc4c(%rip), %xmm3
000000000039a024	nopw	%cs:(%rax,%rax)
000000000039a030	movq	%rcx, -0x58(%rbp)
000000000039a034	xorl	%r10d, %r10d
000000000039a037	nopw	(%rax,%rax)
000000000039a040	movaps	(%rsi,%r10), %xmm2
000000000039a045	movaps	%xmm2, -0x130(%rbp)
000000000039a04c	movq	0x198(%r14), %r11
000000000039a053	movaps	(%r11), %xmm7
000000000039a057	movaps	%xmm7, -0x120(%rbp)
000000000039a05e	movaps	0x20(%r11), %xmm1
000000000039a063	movaps	0x60(%r11), %xmm4
000000000039a068	movaps	%xmm7, %xmm0
000000000039a06b	shufps	$0x0, %xmm7, %xmm0              ## xmm0 = xmm0[0,0],xmm7[0,0]
000000000039a06f	mulps	%xmm2, %xmm0
000000000039a072	shufps	$0x55, %xmm7, %xmm7             ## xmm7 = xmm7[1,1,1,1]
000000000039a076	movaps	%xmm1, %xmm2
000000000039a079	addps	%xmm0, %xmm7
000000000039a07c	shufps	$0x55, %xmm1, %xmm2             ## xmm2 = xmm2[1,1],xmm1[1,1]
000000000039a080	subps	%xmm4, %xmm2
000000000039a083	movaps	0x80(%r11), %xmm0
000000000039a08b	movaps	%xmm0, -0x90(%rbp)
000000000039a092	mulps	%xmm2, %xmm7
000000000039a095	maxps	%xmm0, %xmm7
000000000039a098	minps	%xmm2, %xmm7
000000000039a09b	roundps	$0x9, %xmm7, %xmm0
000000000039a0a1	movaps	%xmm4, %xmm11
000000000039a0a5	movaps	%xmm4, %xmm6
000000000039a0a8	movaps	%xmm4, -0xa0(%rbp)
000000000039a0af	addps	%xmm0, %xmm11
000000000039a0b3	minps	%xmm2, %xmm11
000000000039a0b7	subps	%xmm0, %xmm11
000000000039a0bb	mulps	%xmm1, %xmm11
000000000039a0bf	dpps	$0x3f, %xmm0, %xmm1
000000000039a0c5	subps	%xmm0, %xmm7
000000000039a0c8	insertps	$0x90, %xmm0, %xmm1             ## xmm1 = xmm1[0],xmm0[2],xmm1[2,3]
000000000039a0ce	addps	0xa0(%r11), %xmm1
000000000039a0d6	movl	0x68(%rbx), %r15d
000000000039a0da	movaps	%xmm1, %xmm0
000000000039a0dd	movaps	-0x40(%rbp), %xmm5
000000000039a0e1	subps	%xmm5, %xmm0
000000000039a0e4	addps	%xmm3, %xmm0
000000000039a0e7	roundps	$0x1, %xmm0, %xmm0
000000000039a0ed	cvtps2dq	%xmm0, %xmm2
000000000039a0f1	movq	0x60(%rbx), %r12
000000000039a0f5	movd	%xmm2, %edx
000000000039a0f9	movaps	%xmm1, %xmm0
000000000039a0fc	addss	%xmm11, %xmm0
000000000039a101	pextrd	$0x1, %xmm2, %ecx
000000000039a107	movaps	%xmm1, -0x110(%rbp)
000000000039a10e	movshdup	%xmm11, %xmm2                   ## xmm2 = xmm11[1,1,3,3]
000000000039a113	addss	%xmm2, %xmm0
000000000039a117	imull	%r15d, %ecx
000000000039a11b	movaps	%xmm1, %xmm3
000000000039a11e	blendps	$0x1, %xmm0, %xmm3              ## xmm3 = xmm0[0],xmm3[1,2,3]
000000000039a124	movaps	%xmm3, -0x100(%rbp)
000000000039a12b	subss	%xmm11, %xmm0
000000000039a130	addl	%edx, %ecx
000000000039a132	blendps	$0x1, %xmm0, %xmm1              ## xmm1 = xmm0[0],xmm1[1,2,3]
000000000039a138	xorps	%xmm3, %xmm3
000000000039a13b	unpckhps	%xmm11, %xmm3                   ## xmm3 = xmm3[2],xmm11[2],xmm3[3],xmm11[3]
000000000039a13f	movslq	%ecx, %rcx
000000000039a142	addps	%xmm1, %xmm3
000000000039a145	subps	%xmm5, %xmm1
000000000039a148	shlq	$0x4, %rcx
000000000039a14c	addps	0x2db1d(%rip), %xmm1
000000000039a153	roundps	$0x1, %xmm1, %xmm1
000000000039a159	cvtps2dq	%xmm1, %xmm1
000000000039a15d	movaps	(%r12,%rcx), %xmm9
000000000039a162	movd	%xmm1, %ecx
000000000039a166	movaps	%xmm3, %xmm4
000000000039a169	pextrd	$0x1, %xmm1, %edx
000000000039a16f	blendps	$0x1, %xmm0, %xmm4              ## xmm4 = xmm0[0],xmm4[1,2,3]
000000000039a175	subps	%xmm5, %xmm4
000000000039a178	addps	0x2daf1(%rip), %xmm4
000000000039a17f	imull	%r15d, %edx
000000000039a183	roundps	$0x1, %xmm4, %xmm1
000000000039a189	cvtps2dq	%xmm1, %xmm1
000000000039a18d	movd	%xmm1, %r8d
000000000039a192	addl	%ecx, %edx
000000000039a194	pextrd	$0x1, %xmm1, %ecx
000000000039a19a	subss	%xmm2, %xmm0
000000000039a19e	movslq	%edx, %r9
000000000039a1a1	movaps	%xmm3, %xmm1
000000000039a1a4	blendps	$0x1, %xmm0, %xmm1              ## xmm1 = xmm0[0],xmm1[1,2,3]
000000000039a1aa	subps	%xmm5, %xmm1
000000000039a1ad	imull	%r15d, %ecx
000000000039a1b1	addps	0x2dab8(%rip), %xmm1
000000000039a1b8	roundps	$0x1, %xmm1, %xmm1
000000000039a1be	cvtps2dq	%xmm1, %xmm1
000000000039a1c2	shlq	$0x4, %r9
000000000039a1c6	movd	%xmm1, %r13d
000000000039a1cb	pextrd	$0x1, %xmm1, %edx
000000000039a1d1	movaps	(%r12,%r9), %xmm4
000000000039a1d6	addss	%xmm11, %xmm0
000000000039a1db	movaps	%xmm3, %xmm1
000000000039a1de	blendps	$0x1, %xmm0, %xmm1              ## xmm1 = xmm0[0],xmm1[1,2,3]
000000000039a1e4	addl	%r8d, %ecx
000000000039a1e7	subps	%xmm5, %xmm1
000000000039a1ea	addps	0x2da7f(%rip), %xmm1
000000000039a1f1	roundps	$0x1, %xmm1, %xmm1
000000000039a1f7	movslq	%ecx, %rcx
000000000039a1fa	cvtps2dq	%xmm1, %xmm1
000000000039a1fe	extractps	$0x1, %xmm1, %r8d
000000000039a205	shlq	$0x4, %rcx
000000000039a209	addss	%xmm2, %xmm0
000000000039a20d	blendps	$0xe, %xmm3, %xmm0              ## xmm0 = xmm0[0],xmm3[1,2,3]
000000000039a213	subps	%xmm5, %xmm0
000000000039a216	movaps	(%r12,%rcx), %xmm5
000000000039a21b	addps	0x2da4e(%rip), %xmm0
000000000039a222	roundps	$0x1, %xmm0, %xmm0
000000000039a228	cvtps2dq	%xmm0, %xmm0
000000000039a22c	movd	%xmm0, %ecx
000000000039a230	pextrd	$0x1, %xmm0, %r9d
000000000039a237	imull	%r15d, %r9d
000000000039a23b	addl	%ecx, %r9d
000000000039a23e	movd	%xmm1, %ecx
000000000039a242	movslq	%r9d, %r9
000000000039a245	movaps	%xmm7, %xmm0
000000000039a248	shlq	$0x4, %r9
000000000039a24c	shufps	$0x68, %xmm7, %xmm0             ## xmm0 = xmm0[0,2],xmm7[2,1]
000000000039a250	movaps	%xmm7, %xmm8
000000000039a254	shufps	$0x91, %xmm7, %xmm8             ## xmm8 = xmm8[1,0],xmm7[1,2]
000000000039a259	movaps	(%r12,%r9), %xmm12
000000000039a25e	movaps	%xmm12, -0x80(%rbp)
000000000039a263	cmpltps	%xmm0, %xmm8
000000000039a268	movaps	%xmm5, %xmm13
000000000039a26c	subps	%xmm5, %xmm12
000000000039a270	movaps	%xmm4, -0xf0(%rbp)
000000000039a277	subps	%xmm4, %xmm13
000000000039a27b	movaps	%xmm4, %xmm0
000000000039a27e	movaps	%xmm9, %xmm4
000000000039a282	movaps	%xmm9, -0xb0(%rbp)
000000000039a28a	subps	%xmm9, %xmm0
000000000039a28e	movaps	%xmm7, %xmm1
000000000039a291	shufps	$0x0, %xmm7, %xmm1              ## xmm1 = xmm1[0,0],xmm7[0,0]
000000000039a295	movaps	%xmm1, -0x70(%rbp)
000000000039a299	movaps	%xmm7, %xmm9
000000000039a29d	shufps	$0x55, %xmm7, %xmm9             ## xmm9 = xmm9[1,1],xmm7[1,1]
000000000039a2a2	mulps	%xmm1, %xmm12
000000000039a2a6	mulps	%xmm9, %xmm0
000000000039a2aa	movaps	%xmm0, %xmm1
000000000039a2ad	movaps	%xmm0, -0xc0(%rbp)
000000000039a2b4	movshdup	%xmm7, %xmm0                    ## xmm0 = xmm7[1,1,3,3]
000000000039a2b8	movaps	%xmm0, -0xe0(%rbp)
000000000039a2bf	movaps	%xmm7, -0xd0(%rbp)
000000000039a2c6	movaps	%xmm7, %xmm10
000000000039a2ca	movaps	%xmm7, %xmm15
000000000039a2ce	shufps	$0xaa, %xmm7, %xmm7             ## xmm7 = xmm7[2,2,2,2]
000000000039a2d2	movaps	%xmm1, %xmm0
000000000039a2d5	addps	%xmm12, %xmm0
000000000039a2d9	mulps	%xmm7, %xmm13
000000000039a2dd	addps	%xmm0, %xmm13
000000000039a2e1	andps	%xmm6, %xmm8
000000000039a2e5	pshufd	$0x0, %xmm8, %xmm0              ## xmm0 = xmm8[0,0,0,0]
000000000039a2eb	pshufd	$0x55, %xmm8, %xmm2             ## xmm2 = xmm8[1,1,1,1]
000000000039a2f1	minps	%xmm2, %xmm0
000000000039a2f4	imull	%r15d, %edx
000000000039a2f8	addl	%r13d, %edx
000000000039a2fb	movslq	%edx, %rdx
000000000039a2fe	shlq	$0x4, %rdx
000000000039a302	imull	%r15d, %r8d
000000000039a306	addl	%ecx, %r8d
000000000039a309	movslq	%r8d, %rcx
000000000039a30c	shlq	$0x4, %rcx
000000000039a310	movaps	(%r12,%rdx), %xmm3
000000000039a315	movaps	(%r12,%rcx), %xmm6
000000000039a31a	movaps	%xmm6, %xmm2
000000000039a31d	subps	%xmm3, %xmm2
000000000039a320	movaps	-0x80(%rbp), %xmm14
000000000039a325	subps	%xmm6, %xmm14
000000000039a329	movaps	%xmm3, %xmm1
000000000039a32c	subps	%xmm4, %xmm1
000000000039a32f	mulps	-0x70(%rbp), %xmm2
000000000039a333	mulps	%xmm9, %xmm14
000000000039a337	addps	%xmm14, %xmm2
000000000039a33b	mulps	%xmm7, %xmm1
000000000039a33e	movaps	-0x90(%rbp), %xmm4
000000000039a345	cmpnleps	%xmm4, %xmm0
000000000039a349	addps	%xmm1, %xmm2
000000000039a34c	blendvps	%xmm0, %xmm2, %xmm13
000000000039a352	subps	%xmm3, %xmm5
000000000039a355	shufps	$0x81, %xmm10, %xmm10           ## xmm10 = xmm10[1,0,0,2]
000000000039a35a	shufps	$0x64, %xmm15, %xmm15           ## xmm15 = xmm15[0,1,2,1]
000000000039a35f	cmpleps	%xmm10, %xmm15
000000000039a364	movaps	-0x40(%rbp), %xmm2
000000000039a368	mulps	%xmm9, %xmm5
000000000039a36c	addps	%xmm12, %xmm5
000000000039a370	addps	%xmm1, %xmm5
000000000039a373	movaps	-0xa0(%rbp), %xmm12
000000000039a37b	andps	%xmm12, %xmm15
000000000039a37f	pshufd	$0x0, %xmm15, %xmm0             ## xmm0 = xmm15[0,0,0,0]
000000000039a385	pshufd	$0xaa, %xmm8, %xmm1             ## xmm1 = xmm8[2,2,2,2]
000000000039a38b	minps	%xmm1, %xmm0
000000000039a38e	cmpnleps	%xmm4, %xmm0
000000000039a392	blendvps	%xmm0, %xmm5, %xmm13
000000000039a398	movaps	-0x110(%rbp), %xmm0
000000000039a39f	addss	%xmm11, %xmm0
000000000039a3a4	subps	%xmm2, %xmm0
000000000039a3a7	addps	0x2d8c2(%rip), %xmm0
000000000039a3ae	roundps	$0x1, %xmm0, %xmm0
000000000039a3b4	cvtps2dq	%xmm0, %xmm0
000000000039a3b8	movd	%xmm0, %ecx
000000000039a3bc	pextrd	$0x1, %xmm0, %edx
000000000039a3c2	movaps	-0x100(%rbp), %xmm0
000000000039a3c9	subps	%xmm2, %xmm0
000000000039a3cc	addps	0x2d89d(%rip), %xmm0
000000000039a3d3	roundps	$0x1, %xmm0, %xmm0
000000000039a3d9	cvtps2dq	%xmm0, %xmm0
000000000039a3dd	extractps	$0x1, %xmm0, %r8d
000000000039a3e4	movd	%xmm0, %r9d
000000000039a3e9	imull	%r15d, %edx
000000000039a3ed	addl	%ecx, %edx
000000000039a3ef	imull	%r15d, %r8d
000000000039a3f3	addl	%r9d, %r8d
000000000039a3f6	movslq	%edx, %rcx
000000000039a3f9	shlq	$0x4, %rcx
000000000039a3fd	movslq	%r8d, %rdx
000000000039a400	shlq	$0x4, %rdx
000000000039a404	movaps	(%r12,%rcx), %xmm1
000000000039a409	movaps	(%r12,%rdx), %xmm5
000000000039a40e	movaps	%xmm5, %xmm2
000000000039a411	subps	%xmm1, %xmm2
000000000039a414	mulps	%xmm9, %xmm2
000000000039a418	pshufd	$0xff, %xmm8, %xmm0             ## xmm0 = xmm8[3,3,3,3]
000000000039a41e	pshufd	$0x55, %xmm15, %xmm3            ## xmm3 = xmm15[1,1,1,1]
000000000039a424	minps	%xmm3, %xmm0
000000000039a427	movaps	-0x80(%rbp), %xmm4
000000000039a42b	subps	%xmm5, %xmm4
000000000039a42e	movaps	%xmm1, %xmm3
000000000039a431	movaps	-0xb0(%rbp), %xmm10
000000000039a439	subps	%xmm10, %xmm3
000000000039a43d	movaps	-0x70(%rbp), %xmm11
000000000039a442	mulps	%xmm11, %xmm3
000000000039a446	addps	%xmm3, %xmm2
000000000039a449	mulps	%xmm7, %xmm4
000000000039a44c	addps	%xmm4, %xmm2
000000000039a44f	movaps	%xmm4, %xmm9
000000000039a453	movaps	-0x90(%rbp), %xmm8
000000000039a45b	cmpnleps	%xmm8, %xmm0
000000000039a460	blendvps	%xmm0, %xmm2, %xmm13
000000000039a466	movaps	-0xd0(%rbp), %xmm0
000000000039a46d	cmpltss	-0xe0(%rbp), %xmm0
000000000039a476	andps	%xmm12, %xmm0
000000000039a47a	subps	-0xf0(%rbp), %xmm5
000000000039a481	mulps	%xmm11, %xmm5
000000000039a485	addps	-0xc0(%rbp), %xmm5
000000000039a48c	pshufd	$0xaa, %xmm15, %xmm2            ## xmm2 = xmm15[2,2,2,2]
000000000039a492	pshufd	$0x0, %xmm0, %xmm4              ## xmm4 = xmm0[0,0,0,0]
000000000039a497	addps	%xmm9, %xmm5
000000000039a49b	movdqa	%xmm2, %xmm0
000000000039a49f	minps	%xmm4, %xmm0
000000000039a4a2	cmpnleps	%xmm8, %xmm0
000000000039a4a7	blendvps	%xmm0, %xmm5, %xmm13
000000000039a4ad	subps	%xmm1, %xmm6
000000000039a4b0	pshufd	$0xff, %xmm15, %xmm0            ## xmm0 = xmm15[3,3,3,3]
000000000039a4b6	minps	%xmm2, %xmm0
000000000039a4b9	addps	%xmm14, %xmm3
000000000039a4bd	mulps	%xmm7, %xmm6
000000000039a4c0	addps	%xmm3, %xmm6
000000000039a4c3	movaps	0x2d7a6(%rip), %xmm3
000000000039a4ca	cmpnleps	%xmm8, %xmm0
000000000039a4cf	blendvps	%xmm0, %xmm6, %xmm13
000000000039a4d5	addps	%xmm10, %xmm13
000000000039a4d9	movaps	-0x120(%rbp), %xmm1
000000000039a4e0	movaps	%xmm1, %xmm0
000000000039a4e3	shufps	$0xaa, %xmm1, %xmm0             ## xmm0 = xmm0[2,2],xmm1[2,2]
000000000039a4e7	mulps	%xmm13, %xmm0
000000000039a4eb	shufps	$0xff, %xmm1, %xmm1             ## xmm1 = xmm1[3,3,3,3]
000000000039a4ef	addps	%xmm0, %xmm1
000000000039a4f2	movaps	0x40(%r11), %xmm0
000000000039a4f7	cmpltps	%xmm8, %xmm0
000000000039a4fc	blendvps	%xmm0, -0x130(%rbp), %xmm1
000000000039a505	movaps	%xmm1, (%rdi,%r10)
000000000039a50a	addq	$0x10, %r10
000000000039a50e	cmpq	%r10, %rax
000000000039a511	jne	0x39a040
000000000039a517	movq	-0x58(%rbp), %rcx
000000000039a51b	incl	%ecx
000000000039a51d	addq	-0x50(%rbp), %rsi
000000000039a521	addq	-0x48(%rbp), %rdi
000000000039a525	cmpl	-0x2c(%rbp), %ecx
000000000039a528	jne	0x39a030
000000000039a52e	jmp	0x399f9e
000000000039a533	testl	%edx, %edx
000000000039a535	jle	0x399f9e
000000000039a53b	testl	%ecx, %ecx
000000000039a53d	jle	0x399f9e
000000000039a543	movl	%ecx, %eax
000000000039a545	shlq	$0x4, -0x50(%rbp)
000000000039a54a	shlq	$0x4, -0x48(%rbp)
000000000039a54f	shlq	$0x4, %rax
000000000039a553	xorl	%ecx, %ecx
000000000039a555	nopw	%cs:(%rax,%rax)
000000000039a560	movq	%rcx, -0x58(%rbp)
000000000039a564	xorl	%r10d, %r10d
000000000039a567	nopw	(%rax,%rax)
000000000039a570	movaps	(%rsi,%r10), %xmm2
000000000039a575	movaps	%xmm2, -0x130(%rbp)
000000000039a57c	movq	0x198(%r14), %r11
000000000039a583	movaps	(%r11), %xmm8
000000000039a587	movaps	%xmm8, -0x120(%rbp)
000000000039a58f	movaps	0x20(%r11), %xmm0
000000000039a594	movaps	0x60(%r11), %xmm4
000000000039a599	movaps	%xmm8, %xmm1
000000000039a59d	shufps	$0x0, %xmm8, %xmm1              ## xmm1 = xmm1[0,0],xmm8[0,0]
000000000039a5a2	mulps	%xmm2, %xmm1
000000000039a5a5	shufps	$0x55, %xmm8, %xmm8             ## xmm8 = xmm8[1,1,1,1]
000000000039a5aa	movaps	%xmm0, %xmm2
000000000039a5ad	shufps	$0x55, %xmm0, %xmm2             ## xmm2 = xmm2[1,1],xmm0[1,1]
000000000039a5b1	addps	%xmm1, %xmm8
000000000039a5b5	subps	%xmm4, %xmm2
000000000039a5b8	movaps	%xmm4, -0x80(%rbp)
000000000039a5bc	mulps	%xmm2, %xmm8
000000000039a5c0	movaps	0x80(%r11), %xmm1
000000000039a5c8	movaps	%xmm1, -0x90(%rbp)
000000000039a5cf	maxps	%xmm1, %xmm8
000000000039a5d3	minps	%xmm2, %xmm8
000000000039a5d7	cvtps2dq	%xmm8, %xmm1
000000000039a5dc	cvtdq2ps	%xmm1, %xmm1
000000000039a5df	movaps	%xmm8, %xmm3
000000000039a5e3	cmpltps	%xmm1, %xmm3
000000000039a5e7	cvtdq2ps	%xmm3, %xmm3
000000000039a5ea	addps	%xmm1, %xmm3
000000000039a5ed	subps	%xmm3, %xmm8
000000000039a5f1	movaps	%xmm4, %xmm1
000000000039a5f4	addps	%xmm3, %xmm1
000000000039a5f7	minps	%xmm2, %xmm1
000000000039a5fa	subps	%xmm3, %xmm1
000000000039a5fd	mulps	%xmm0, %xmm1
000000000039a600	movaps	%xmm1, %xmm4
000000000039a603	mulps	%xmm3, %xmm0
000000000039a606	movshdup	%xmm0, %xmm1                    ## xmm1 = xmm0[1,1,3,3]
000000000039a60a	addps	%xmm0, %xmm1
000000000039a60d	blendps	$0xc, %xmm3, %xmm1              ## xmm1 = xmm1[0,1],xmm3[2,3]
000000000039a613	shufps	$0xf8, %xmm1, %xmm1             ## xmm1 = xmm1[0,2,3,3]
000000000039a617	addps	0xa0(%r11), %xmm1
000000000039a61f	movq	0x60(%rbx), %r15
000000000039a623	movl	0x68(%rbx), %r12d
000000000039a627	movaps	%xmm1, %xmm0
000000000039a62a	subps	-0x40(%rbp), %xmm0
000000000039a62e	movaps	0x2d63b(%rip), %xmm7
000000000039a635	addps	%xmm7, %xmm0
000000000039a638	cvtps2dq	%xmm0, %xmm2
000000000039a63c	cvtdq2ps	%xmm2, %xmm3
000000000039a63f	cmpltps	%xmm3, %xmm0
000000000039a643	paddd	%xmm2, %xmm0
000000000039a647	movd	%xmm0, %edx
000000000039a64b	pextrd	$0x1, %xmm0, %ecx
000000000039a651	movaps	%xmm1, %xmm0
000000000039a654	addss	%xmm4, %xmm0
000000000039a658	movaps	%xmm1, -0x110(%rbp)
000000000039a65f	imull	%r12d, %ecx
000000000039a663	movshdup	%xmm4, %xmm3                    ## xmm3 = xmm4[1,1,3,3]
000000000039a667	addss	%xmm3, %xmm0
000000000039a66b	movaps	%xmm1, %xmm10
000000000039a66f	addl	%edx, %ecx
000000000039a671	blendps	$0x1, %xmm0, %xmm10             ## xmm10 = xmm0[0],xmm10[1,2,3]
000000000039a678	subss	%xmm4, %xmm0
000000000039a67c	blendps	$0x1, %xmm0, %xmm1              ## xmm1 = xmm0[0],xmm1[1,2,3]
000000000039a682	movslq	%ecx, %rcx
000000000039a685	xorps	%xmm2, %xmm2
000000000039a688	unpckhps	%xmm4, %xmm2                    ## xmm2 = xmm2[2],xmm4[2],xmm2[3],xmm4[3]
000000000039a68b	movaps	%xmm4, %xmm6
000000000039a68e	movaps	%xmm4, -0x100(%rbp)
000000000039a695	addps	%xmm1, %xmm2
000000000039a698	shlq	$0x4, %rcx
000000000039a69c	movaps	%xmm1, %xmm4
000000000039a69f	subps	-0x40(%rbp), %xmm4
000000000039a6a3	addps	%xmm7, %xmm4
000000000039a6a6	movaps	(%r15,%rcx), %xmm9
000000000039a6ab	movaps	%xmm9, -0x70(%rbp)
000000000039a6b0	cvtps2dq	%xmm4, %xmm1
000000000039a6b4	cvtdq2ps	%xmm1, %xmm5
000000000039a6b7	cmpltps	%xmm5, %xmm4
000000000039a6bb	paddd	%xmm1, %xmm4
000000000039a6bf	movd	%xmm4, %edx
000000000039a6c3	movaps	%xmm2, %xmm1
000000000039a6c6	pextrd	$0x1, %xmm4, %ecx
000000000039a6cc	blendps	$0x1, %xmm0, %xmm1              ## xmm1 = xmm0[0],xmm1[1,2,3]
000000000039a6d2	subps	-0x40(%rbp), %xmm1
000000000039a6d6	addps	%xmm7, %xmm1
000000000039a6d9	imull	%r12d, %ecx
000000000039a6dd	cvtps2dq	%xmm1, %xmm4
000000000039a6e1	cvtdq2ps	%xmm4, %xmm5
000000000039a6e4	cmpltps	%xmm5, %xmm1
000000000039a6e8	paddd	%xmm4, %xmm1
000000000039a6ec	subss	%xmm3, %xmm0
000000000039a6f0	movaps	%xmm2, %xmm5
000000000039a6f3	blendps	$0x1, %xmm0, %xmm5              ## xmm5 = xmm0[0],xmm5[1,2,3]
000000000039a6f9	movd	%xmm1, %r8d
000000000039a6fe	subps	-0x40(%rbp), %xmm5
000000000039a702	addps	%xmm7, %xmm5
000000000039a705	pextrd	$0x1, %xmm1, %r9d
000000000039a70c	cvtps2dq	%xmm5, %xmm1
000000000039a710	cvtdq2ps	%xmm1, %xmm4
000000000039a713	cmpltps	%xmm4, %xmm5
000000000039a717	addl	%edx, %ecx
000000000039a719	paddd	%xmm1, %xmm5
000000000039a71d	addss	%xmm6, %xmm0
000000000039a721	movaps	%xmm2, %xmm1
000000000039a724	movslq	%ecx, %rcx
000000000039a727	blendps	$0x1, %xmm0, %xmm1              ## xmm1 = xmm0[0],xmm1[1,2,3]
000000000039a72d	subps	-0x40(%rbp), %xmm1
000000000039a731	addps	%xmm7, %xmm1
000000000039a734	shlq	$0x4, %rcx
000000000039a738	cvtps2dq	%xmm1, %xmm4
000000000039a73c	cvtdq2ps	%xmm4, %xmm6
000000000039a73f	cmpltps	%xmm6, %xmm1
000000000039a743	movaps	(%r15,%rcx), %xmm15
000000000039a748	imull	%r12d, %r9d
000000000039a74c	pextrd	$0x1, %xmm5, %edx
000000000039a752	addl	%r8d, %r9d
000000000039a755	paddd	%xmm4, %xmm1
000000000039a759	pextrd	$0x1, %xmm1, %r13d
000000000039a760	movslq	%r9d, %rcx
000000000039a763	movd	%xmm5, %r8d
000000000039a768	addss	%xmm3, %xmm0
000000000039a76c	blendps	$0xe, %xmm2, %xmm0              ## xmm0 = xmm0[0],xmm2[1,2,3]
000000000039a772	shlq	$0x4, %rcx
000000000039a776	subps	-0x40(%rbp), %xmm0
000000000039a77a	addps	%xmm7, %xmm0
000000000039a77d	cvtps2dq	%xmm0, %xmm2
000000000039a781	movaps	(%r15,%rcx), %xmm6
000000000039a786	cvtdq2ps	%xmm2, %xmm3
000000000039a789	cmpltps	%xmm3, %xmm0
000000000039a78d	paddd	%xmm2, %xmm0
000000000039a791	movd	%xmm0, %ecx
000000000039a795	pextrd	$0x1, %xmm0, %r9d
000000000039a79c	imull	%r12d, %r9d
000000000039a7a0	addl	%ecx, %r9d
000000000039a7a3	movd	%xmm1, %ecx
000000000039a7a7	movslq	%r9d, %r9
000000000039a7aa	movaps	%xmm8, %xmm0
000000000039a7ae	shlq	$0x4, %r9
000000000039a7b2	shufps	$0x68, %xmm8, %xmm0             ## xmm0 = xmm0[0,2],xmm8[2,1]
000000000039a7b7	movaps	%xmm8, %xmm7
000000000039a7bb	shufps	$0x91, %xmm8, %xmm7             ## xmm7 = xmm7[1,0],xmm8[1,2]
000000000039a7c0	movaps	(%r15,%r9), %xmm14
000000000039a7c5	cmpltps	%xmm0, %xmm7
000000000039a7c9	movaps	%xmm14, %xmm12
000000000039a7cd	movaps	%xmm14, -0xb0(%rbp)
000000000039a7d5	movaps	%xmm6, %xmm13
000000000039a7d9	subps	%xmm6, %xmm12
000000000039a7dd	movaps	%xmm15, -0xf0(%rbp)
000000000039a7e5	subps	%xmm15, %xmm13
000000000039a7e9	movaps	%xmm15, %xmm0
000000000039a7ed	subps	%xmm9, %xmm0
000000000039a7f1	movaps	%xmm8, %xmm11
000000000039a7f5	shufps	$0x0, %xmm8, %xmm11             ## xmm11 = xmm11[0,0],xmm8[0,0]
000000000039a7fa	movaps	%xmm8, %xmm5
000000000039a7fe	shufps	$0x55, %xmm8, %xmm5             ## xmm5 = xmm5[1,1],xmm8[1,1]
000000000039a803	mulps	%xmm11, %xmm12
000000000039a807	movaps	%xmm11, -0xa0(%rbp)
000000000039a80f	mulps	%xmm5, %xmm0
000000000039a812	movaps	%xmm0, %xmm1
000000000039a815	movaps	%xmm0, -0xc0(%rbp)
000000000039a81c	movshdup	%xmm8, %xmm0                    ## xmm0 = xmm8[1,1,3,3]
000000000039a821	movaps	%xmm0, -0xe0(%rbp)
000000000039a828	movaps	%xmm8, -0xd0(%rbp)
000000000039a830	movaps	%xmm8, %xmm9
000000000039a834	movaps	%xmm8, %xmm15
000000000039a838	shufps	$0xaa, %xmm8, %xmm8             ## xmm8 = xmm8[2,2,2,2]
000000000039a83d	movaps	%xmm1, %xmm0
000000000039a840	addps	%xmm12, %xmm0
000000000039a844	mulps	%xmm8, %xmm13
000000000039a848	addps	%xmm0, %xmm13
000000000039a84c	andps	-0x80(%rbp), %xmm7
000000000039a850	pshufd	$0x0, %xmm7, %xmm0              ## xmm0 = xmm7[0,0,0,0]
000000000039a855	pshufd	$0x55, %xmm7, %xmm1             ## xmm1 = xmm7[1,1,1,1]
000000000039a85a	minps	%xmm1, %xmm0
000000000039a85d	imull	%r12d, %edx
000000000039a861	addl	%r8d, %edx
000000000039a864	movslq	%edx, %rdx
000000000039a867	shlq	$0x4, %rdx
000000000039a86b	imull	%r12d, %r13d
000000000039a86f	addl	%ecx, %r13d
000000000039a872	movslq	%r13d, %rcx
000000000039a875	shlq	$0x4, %rcx
000000000039a879	movaps	(%r15,%rdx), %xmm3
000000000039a87e	movaps	(%r15,%rcx), %xmm4
000000000039a883	movaps	%xmm4, %xmm1
000000000039a886	subps	%xmm3, %xmm1
000000000039a889	subps	%xmm4, %xmm14
000000000039a88d	movaps	%xmm3, %xmm2
000000000039a890	subps	-0x70(%rbp), %xmm2
000000000039a894	mulps	%xmm11, %xmm1
000000000039a898	mulps	%xmm5, %xmm14
000000000039a89c	addps	%xmm14, %xmm1
000000000039a8a0	mulps	%xmm8, %xmm2
000000000039a8a4	movaps	-0x90(%rbp), %xmm11
000000000039a8ac	cmpleps	%xmm11, %xmm0
000000000039a8b1	addps	%xmm2, %xmm1
000000000039a8b4	blendvps	%xmm0, %xmm13, %xmm1
000000000039a8ba	subps	%xmm3, %xmm6
000000000039a8bd	shufps	$0x81, %xmm9, %xmm9             ## xmm9 = xmm9[1,0,0,2]
000000000039a8c2	shufps	$0x64, %xmm15, %xmm15           ## xmm15 = xmm15[0,1,2,1]
000000000039a8c7	cmpleps	%xmm9, %xmm15
000000000039a8cc	movaps	0x2d39c(%rip), %xmm9
000000000039a8d4	mulps	%xmm5, %xmm6
000000000039a8d7	addps	%xmm12, %xmm6
000000000039a8db	addps	%xmm2, %xmm6
000000000039a8de	movaps	-0x80(%rbp), %xmm12
000000000039a8e3	andps	%xmm12, %xmm15
000000000039a8e7	pshufd	$0x0, %xmm15, %xmm0             ## xmm0 = xmm15[0,0,0,0]
000000000039a8ed	pshufd	$0xaa, %xmm7, %xmm2             ## xmm2 = xmm7[2,2,2,2]
000000000039a8f2	minps	%xmm2, %xmm0
000000000039a8f5	cmpleps	%xmm11, %xmm0
000000000039a8fa	blendvps	%xmm0, %xmm1, %xmm6
000000000039a8ff	movaps	-0x110(%rbp), %xmm2
000000000039a906	addss	-0x100(%rbp), %xmm2
000000000039a90e	subps	-0x40(%rbp), %xmm2
000000000039a912	addps	%xmm9, %xmm2
000000000039a916	cvtps2dq	%xmm2, %xmm0
000000000039a91a	cvtdq2ps	%xmm0, %xmm1
000000000039a91d	cmpltps	%xmm1, %xmm2
000000000039a921	paddd	%xmm0, %xmm2
000000000039a925	movd	%xmm2, %ecx
000000000039a929	pextrd	$0x1, %xmm2, %edx
000000000039a92f	subps	-0x40(%rbp), %xmm10
000000000039a934	addps	%xmm9, %xmm10
000000000039a938	cvtps2dq	%xmm10, %xmm0
000000000039a93d	cvtdq2ps	%xmm0, %xmm1
000000000039a940	cmpltps	%xmm1, %xmm10
000000000039a945	paddd	%xmm0, %xmm10
000000000039a94a	pextrd	$0x1, %xmm10, %r8d
000000000039a951	movd	%xmm10, %r9d
000000000039a956	imull	%r12d, %edx
000000000039a95a	addl	%ecx, %edx
000000000039a95c	imull	%r12d, %r8d
000000000039a960	addl	%r9d, %r8d
000000000039a963	movslq	%edx, %rcx
000000000039a966	shlq	$0x4, %rcx
000000000039a96a	movslq	%r8d, %rdx
000000000039a96d	shlq	$0x4, %rdx
000000000039a971	movaps	(%r15,%rcx), %xmm9
000000000039a976	movaps	(%r15,%rdx), %xmm3
000000000039a97b	movaps	%xmm3, %xmm10
000000000039a97f	subps	%xmm9, %xmm10
000000000039a983	mulps	%xmm5, %xmm10
000000000039a987	pshufd	$0xff, %xmm7, %xmm0             ## xmm0 = xmm7[3,3,3,3]
000000000039a98c	pshufd	$0x55, %xmm15, %xmm2            ## xmm2 = xmm15[1,1,1,1]
000000000039a992	minps	%xmm2, %xmm0
000000000039a995	movaps	-0xb0(%rbp), %xmm11
000000000039a99d	subps	%xmm3, %xmm11
000000000039a9a1	movaps	%xmm9, %xmm5
000000000039a9a5	movaps	-0x70(%rbp), %xmm13
000000000039a9aa	subps	%xmm13, %xmm5
000000000039a9ae	movaps	-0xa0(%rbp), %xmm1
000000000039a9b5	mulps	%xmm1, %xmm5
000000000039a9b8	addps	%xmm5, %xmm10
000000000039a9bc	mulps	%xmm8, %xmm11
000000000039a9c0	addps	%xmm11, %xmm10
000000000039a9c4	movaps	-0x90(%rbp), %xmm7
000000000039a9cb	cmpleps	%xmm7, %xmm0
000000000039a9cf	blendvps	%xmm0, %xmm6, %xmm10
000000000039a9d5	movaps	-0xd0(%rbp), %xmm0
000000000039a9dc	cmpltss	-0xe0(%rbp), %xmm0
000000000039a9e5	andps	%xmm12, %xmm0
000000000039a9e9	subps	-0xf0(%rbp), %xmm3
000000000039a9f0	mulps	%xmm1, %xmm3
000000000039a9f3	addps	-0xc0(%rbp), %xmm3
000000000039a9fa	pshufd	$0xaa, %xmm15, %xmm2            ## xmm2 = xmm15[2,2,2,2]
000000000039aa00	pshufd	$0x0, %xmm0, %xmm6              ## xmm6 = xmm0[0,0,0,0]
000000000039aa05	addps	%xmm11, %xmm3
000000000039aa09	movdqa	%xmm2, %xmm0
000000000039aa0d	minps	%xmm6, %xmm0
000000000039aa10	cmpleps	%xmm7, %xmm0
000000000039aa14	blendvps	%xmm0, %xmm10, %xmm3
000000000039aa1a	subps	%xmm9, %xmm4
000000000039aa1e	pshufd	$0xff, %xmm15, %xmm0            ## xmm0 = xmm15[3,3,3,3]
000000000039aa24	minps	%xmm2, %xmm0
000000000039aa27	addps	%xmm14, %xmm5
000000000039aa2b	mulps	%xmm8, %xmm4
000000000039aa2f	addps	%xmm5, %xmm4
000000000039aa32	cmpleps	%xmm7, %xmm0
000000000039aa36	blendvps	%xmm0, %xmm3, %xmm4
000000000039aa3b	addps	%xmm13, %xmm4
000000000039aa3f	movaps	-0x120(%rbp), %xmm1
000000000039aa46	movaps	%xmm1, %xmm0
000000000039aa49	shufps	$0xaa, %xmm1, %xmm0             ## xmm0 = xmm0[2,2],xmm1[2,2]
000000000039aa4d	mulps	%xmm4, %xmm0
000000000039aa50	shufps	$0xff, %xmm1, %xmm1             ## xmm1 = xmm1[3,3,3,3]
000000000039aa54	addps	%xmm0, %xmm1
000000000039aa57	movaps	%xmm1, %xmm2
000000000039aa5a	movaps	0x40(%r11), %xmm0
000000000039aa5f	cmpnltps	%xmm7, %xmm0
000000000039aa63	movaps	-0x130(%rbp), %xmm1
000000000039aa6a	blendvps	%xmm0, %xmm2, %xmm1
000000000039aa6f	movaps	%xmm1, (%rdi,%r10)
000000000039aa74	addq	$0x10, %r10
000000000039aa78	cmpq	%r10, %rax
000000000039aa7b	jne	0x39a570
000000000039aa81	movq	-0x58(%rbp), %rcx
000000000039aa85	incl	%ecx
000000000039aa87	addq	-0x50(%rbp), %rsi
000000000039aa8b	addq	-0x48(%rbp), %rdi
000000000039aa8f	cmpl	-0x2c(%rbp), %ecx
000000000039aa92	jne	0x39a560
000000000039aa98	jmp	0x399f9e
000000000039aa9d	nopl	(%rax)
