__ZN16HGGradientRadial9GetOutputEP10HGRenderer:
000000000008bf00	pushq	%rbp
000000000008bf01	movq	%rsp, %rbp
000000000008bf04	pushq	%r15
000000000008bf06	pushq	%r14
000000000008bf08	pushq	%r13
000000000008bf0a	pushq	%r12
000000000008bf0c	pushq	%rbx
000000000008bf0d	subq	$0x58, %rsp
000000000008bf11	movq	%rsi, %r15
000000000008bf14	movq	%rdi, %rbx
000000000008bf17	movq	0x97633a(%rip), %rax            ## literal pool symbol address: ___stack_chk_guard
000000000008bf1e	movq	(%rax), %rax
000000000008bf21	movq	%rax, -0x30(%rbp)
000000000008bf25	movq	%rsi, %rdi
000000000008bf28	movq	%rbx, %rsi
000000000008bf2b	xorl	%edx, %edx
000000000008bf2d	callq	__ZN10HGRenderer8GetInputEP6HGNodei ## HGRenderer::GetInput(HGNode*, int)
000000000008bf32	movq	%rax, %r14
000000000008bf35	movq	(%r15), %rax
000000000008bf38	movq	%r15, %rdi
000000000008bf3b	callq	*0x130(%rax)
000000000008bf41	testb	%al, %al
000000000008bf43	je	0x8bf6c
000000000008bf45	movq	%r15, %rdi
000000000008bf48	movq	%r14, %rsi
000000000008bf4b	callq	__ZN10HGRenderer6GetDODEP6HGNode ## HGRenderer::GetDOD(HGNode*)
000000000008bf50	movq	%rax, %r12
000000000008bf53	movq	%rdx, %rax
000000000008bf56	shrq	$0x20, %rax
000000000008bf5a	movq	%r12, %rcx
000000000008bf5d	shrq	$0x20, %rcx
000000000008bf61	subl	%ecx, %eax
000000000008bf63	cmpl	$0x1, %eax
000000000008bf66	jbe	0x8c128
000000000008bf6c	movq	(%rbx), %rax
000000000008bf6f	leaq	-0x40(%rbp), %rdx
000000000008bf73	movq	%rbx, %rdi
000000000008bf76	movl	$0x3, %esi
000000000008bf7b	callq	*0x68(%rax)
000000000008bf7e	movq	(%rbx), %rax
000000000008bf81	leaq	-0x50(%rbp), %rdx
000000000008bf85	movq	%rbx, %rdi
000000000008bf88	movl	$0x4, %esi
000000000008bf8d	callq	*0x68(%rax)
000000000008bf90	movq	(%rbx), %rax
000000000008bf93	leaq	-0x60(%rbp), %rdx
000000000008bf97	movq	%rbx, %rdi
000000000008bf9a	movl	$0x5, %esi
000000000008bf9f	callq	*0x68(%rax)
000000000008bfa2	xorps	%xmm3, %xmm3
000000000008bfa5	movss	-0x3c(%rbp), %xmm0
000000000008bfaa	cmpeqss	%xmm3, %xmm0
000000000008bfaf	movss	-0x40(%rbp), %xmm1
000000000008bfb4	cmpeqss	0x33bd03(%rip), %xmm1
000000000008bfbd	andps	%xmm0, %xmm1
000000000008bfc0	movd	%xmm1, %eax
000000000008bfc4	movss	-0x50(%rbp), %xmm5
000000000008bfc9	movss	-0x4c(%rbp), %xmm4
000000000008bfce	movss	-0x60(%rbp), %xmm2
000000000008bfd3	movss	-0x5c(%rbp), %xmm1
000000000008bfd8	movss	-0x54(%rbp), %xmm0
000000000008bfdd	testb	$0x1, %al
000000000008bfdf	je	0x8c029
000000000008bfe1	movss	-0x34(%rbp), %xmm6
000000000008bfe6	ucomiss	%xmm3, %xmm6
000000000008bfe9	jne	0x8c029
000000000008bfeb	jp	0x8c029
000000000008bfed	xorps	%xmm6, %xmm6
000000000008bff0	ucomiss	%xmm6, %xmm5
000000000008bff3	jne	0x8c029
000000000008bff5	jp	0x8c029
000000000008bff7	ucomiss	0x33bcc2(%rip), %xmm4
000000000008bffe	jne	0x8c029
000000000008c000	jp	0x8c029
000000000008c002	movss	-0x44(%rbp), %xmm7
000000000008c007	ucomiss	%xmm6, %xmm7
000000000008c00a	jne	0x8c029
000000000008c00c	jp	0x8c029
000000000008c00e	ucomiss	%xmm6, %xmm2
000000000008c011	jne	0x8c029
000000000008c013	jp	0x8c029
000000000008c015	ucomiss	%xmm6, %xmm1
000000000008c018	jne	0x8c029
000000000008c01a	jp	0x8c029
000000000008c01c	xorl	%ecx, %ecx
000000000008c01e	ucomiss	0x33bc9b(%rip), %xmm0
000000000008c025	jne	0x8c029
000000000008c027	jnp	0x8c086
000000000008c029	ucomiss	%xmm3, %xmm5
000000000008c02c	setnp	%cl
000000000008c02f	sete	%dl
000000000008c032	andb	%cl, %dl
000000000008c034	andb	%dl, %al
000000000008c036	cmpb	$0x1, %al
000000000008c038	jne	0x8c063
000000000008c03a	ucomiss	0x33bc7f(%rip), %xmm4
000000000008c041	jne	0x8c063
000000000008c043	jp	0x8c063
000000000008c045	ucomiss	%xmm3, %xmm2
000000000008c048	jne	0x8c081
000000000008c04a	jp	0x8c081
000000000008c04c	ucomiss	%xmm3, %xmm1
000000000008c04f	jne	0x8c063
000000000008c051	jp	0x8c063
000000000008c053	movl	$0x1, %ecx
000000000008c058	ucomiss	0x33bc61(%rip), %xmm0
000000000008c05f	jne	0x8c063
000000000008c061	jnp	0x8c086
000000000008c063	ucomiss	%xmm3, %xmm2
000000000008c066	jne	0x8c081
000000000008c068	jp	0x8c081
000000000008c06a	ucomiss	%xmm3, %xmm1
000000000008c06d	jne	0x8c081
000000000008c06f	jp	0x8c081
000000000008c071	movl	$0x2, %ecx
000000000008c076	ucomiss	0x33bc43(%rip), %xmm0
000000000008c07d	jne	0x8c081
000000000008c07f	jnp	0x8c086
000000000008c081	movl	$0x3, %ecx
000000000008c086	movl	%ecx, 0x198(%rbx)
000000000008c08c	movq	(%rbx), %rax
000000000008c08f	leaq	-0x70(%rbp), %rdx
000000000008c093	movq	%rbx, %rdi
000000000008c096	movl	$0x2, %esi
000000000008c09b	callq	*0x68(%rax)
000000000008c09e	movss	-0x70(%rbp), %xmm0
000000000008c0a3	movss	-0x6c(%rbp), %xmm1
000000000008c0a8	movss	0x33bc10(%rip), %xmm3
000000000008c0b0	divss	%xmm0, %xmm3
000000000008c0b4	movss	%xmm3, -0x64(%rbp)
000000000008c0b9	movss	-0x68(%rbp), %xmm2
000000000008c0be	movq	(%rbx), %rax
000000000008c0c1	movq	%rbx, %rdi
000000000008c0c4	movl	$0x2, %esi
000000000008c0c9	callq	*0x60(%rax)
000000000008c0cc	leaq	0x198(%rbx), %rax
000000000008c0d3	movl	(%rax), %eax
000000000008c0d5	cmpq	$0x3, %rax
000000000008c0d9	ja	0x8c29e
000000000008c0df	leaq	0x6a2(%rip), %rcx
000000000008c0e6	movslq	(%rcx,%rax,4), %rax
000000000008c0ea	addq	%rcx, %rax
000000000008c0ed	jmpq	*%rax
000000000008c0ef	movl	$0x1a0, %edi                    ## imm = 0x1A0
000000000008c0f4	callq	__ZN8HGObjectnwEm               ## HGObject::operator new(unsigned long)
000000000008c0f9	movq	%rax, %r15
000000000008c0fc	movq	%rax, %rdi
000000000008c0ff	callq	__ZN25HgcGradientRadialIdentityC1Ev ## HgcGradientRadialIdentity::HgcGradientRadialIdentity()
000000000008c104	movq	0x1a0(%rbx), %rdi
000000000008c10b	cmpq	%r15, %rdi
000000000008c10e	je	0x8c635
000000000008c114	testq	%rdi, %rdi
000000000008c117	je	0x8c297
000000000008c11d	movq	(%rdi), %rax
000000000008c120	callq	*0x18(%rax)
000000000008c123	jmp	0x8c297
000000000008c128	movq	%rdx, %r13
000000000008c12b	movl	$0x1d0, %edi                    ## imm = 0x1D0
000000000008c130	callq	__ZN8HGObjectnwEm               ## HGObject::operator new(unsigned long)
000000000008c135	movq	%rax, %r15
000000000008c138	movq	%rax, %rdi
000000000008c13b	callq	__ZN13HGTextureWrapC1Ev         ## HGTextureWrap::HGTextureWrap()
000000000008c140	movq	%r15, %rdi
000000000008c143	movl	$0x3, %esi
000000000008c148	callq	__ZN13HGTextureWrap18SetTextureWrapModeENS_8WrapModeE ## HGTextureWrap::SetTextureWrapMode(HGTextureWrap::WrapMode)
000000000008c14d	xorl	%edi, %edi
000000000008c14f	xorl	%esi, %esi
000000000008c151	xorl	%edx, %edx
000000000008c153	movl	$0x1, %ecx
000000000008c158	callq	_HGRectMake4i
000000000008c15d	movq	%rdx, %rcx
000000000008c160	movq	%r12, %rdi
000000000008c163	movq	%r13, %rsi
000000000008c166	movq	%rax, %rdx
000000000008c169	callq	_HGRectGrow
000000000008c16e	movq	%rax, -0x40(%rbp)
000000000008c172	movq	%rdx, -0x38(%rbp)
000000000008c176	leaq	-0x40(%rbp), %rsi
000000000008c17a	movq	%r15, %rdi
000000000008c17d	callq	__ZN13HGTextureWrap11SetCropRectERK6HGRect ## HGTextureWrap::SetCropRect(HGRect const&)
000000000008c182	movq	(%r15), %rax
000000000008c185	movq	%r15, %rdi
000000000008c188	xorl	%esi, %esi
000000000008c18a	movq	%r14, %rdx
000000000008c18d	callq	*0x78(%rax)
000000000008c190	movl	$0x1b0, %edi                    ## imm = 0x1B0
000000000008c195	callq	__ZN8HGObjectnwEm               ## HGObject::operator new(unsigned long)
000000000008c19a	movq	%rax, %r14
000000000008c19d	movq	%rax, %rdi
000000000008c1a0	callq	__ZN6HGNodeC2Ev                 ## HGNode::HGNode()
000000000008c1a5	leaq	0x97de34(%rip), %rax
000000000008c1ac	movq	%rax, (%r14)
000000000008c1af	movq	$0x0, 0x1a0(%r14)
000000000008c1ba	movq	%r14, %rdi
000000000008c1bd	xorl	%esi, %esi
000000000008c1bf	movl	$0x5, %edx
000000000008c1c4	callq	__ZN6HGNode8SetFlagsEii         ## HGNode::SetFlags(int, int)
000000000008c1c9	orl	$0x601, 0x10(%r14)              ## imm = 0x601
000000000008c1d1	movl	$0x3, 0x198(%r14)
000000000008c1dc	movq	0x1a0(%rbx), %rdi
000000000008c1e3	cmpq	%r14, %rdi
000000000008c1e6	je	0x8c435
000000000008c1ec	testq	%rdi, %rdi
000000000008c1ef	je	0x8c1f7
000000000008c1f1	movq	(%rdi), %rax
000000000008c1f4	callq	*0x18(%rax)
000000000008c1f7	movq	%r14, 0x1a0(%rbx)
000000000008c1fe	jmp	0x8c445
000000000008c203	movl	$0x1a0, %edi                    ## imm = 0x1A0
000000000008c208	callq	__ZN8HGObjectnwEm               ## HGObject::operator new(unsigned long)
000000000008c20d	movq	%rax, %r15
000000000008c210	movq	%rax, %rdi
000000000008c213	callq	__ZN23HgcGradientRadialAffineC1Ev ## HgcGradientRadialAffine::HgcGradientRadialAffine()
000000000008c218	movq	0x1a0(%rbx), %rdi
000000000008c21f	cmpq	%r15, %rdi
000000000008c222	je	0x8c607
000000000008c228	testq	%rdi, %rdi
000000000008c22b	je	0x8c297
000000000008c22d	movq	(%rdi), %rax
000000000008c230	callq	*0x18(%rax)
000000000008c233	jmp	0x8c297
000000000008c235	movl	$0x1a0, %edi                    ## imm = 0x1A0
000000000008c23a	callq	__ZN8HGObjectnwEm               ## HGObject::operator new(unsigned long)
000000000008c23f	movq	%rax, %r15
000000000008c242	movq	%rax, %rdi
000000000008c245	callq	__ZN28HgcGradientRadialPerspectiveC1Ev ## HgcGradientRadialPerspective::HgcGradientRadialPerspective()
000000000008c24a	movq	0x1a0(%rbx), %rdi
000000000008c251	cmpq	%r15, %rdi
000000000008c254	je	0x8c61e
000000000008c25a	testq	%rdi, %rdi
000000000008c25d	je	0x8c297
000000000008c25f	movq	(%rdi), %rax
000000000008c262	callq	*0x18(%rax)
000000000008c265	jmp	0x8c297
000000000008c267	movl	$0x1a0, %edi                    ## imm = 0x1A0
000000000008c26c	callq	__ZN8HGObjectnwEm               ## HGObject::operator new(unsigned long)
000000000008c271	movq	%rax, %r15
000000000008c274	movq	%rax, %rdi
000000000008c277	callq	__ZN26HgcGradientRadialTranslateC1Ev ## HgcGradientRadialTranslate::HgcGradientRadialTranslate()
000000000008c27c	movq	0x1a0(%rbx), %rdi
000000000008c283	cmpq	%r15, %rdi
000000000008c286	je	0x8c64c
000000000008c28c	testq	%rdi, %rdi
000000000008c28f	je	0x8c297
000000000008c291	movq	(%rdi), %rax
000000000008c294	callq	*0x18(%rax)
000000000008c297	movq	%r15, 0x1a0(%rbx)
000000000008c29e	movq	0x1a0(%rbx), %rdi
000000000008c2a5	movq	(%rdi), %rax
000000000008c2a8	xorl	%esi, %esi
000000000008c2aa	movq	%r14, %rdx
000000000008c2ad	callq	*0x78(%rax)
000000000008c2b0	movq	(%rbx), %rax
000000000008c2b3	leaq	-0x80(%rbp), %rdx
000000000008c2b7	movq	%rbx, %rdi
000000000008c2ba	xorl	%esi, %esi
000000000008c2bc	callq	*0x68(%rax)
000000000008c2bf	leaq	0x1a0(%rbx), %r14
000000000008c2c6	movq	(%r14), %rdi
000000000008c2c9	movss	-0x80(%rbp), %xmm0
000000000008c2ce	movss	-0x7c(%rbp), %xmm1
000000000008c2d3	movss	-0x78(%rbp), %xmm2
000000000008c2d8	movss	-0x74(%rbp), %xmm3
000000000008c2dd	movq	(%rdi), %rax
000000000008c2e0	xorl	%esi, %esi
000000000008c2e2	callq	*0x60(%rax)
000000000008c2e5	movq	(%rbx), %rax
000000000008c2e8	leaq	-0x80(%rbp), %rdx
000000000008c2ec	movq	%rbx, %rdi
000000000008c2ef	movl	$0x1, %esi
000000000008c2f4	callq	*0x68(%rax)
000000000008c2f7	leaq	-0x7c(%rbp), %r15
000000000008c2fb	movq	(%r14), %rdi
000000000008c2fe	movss	-0x80(%rbp), %xmm0
000000000008c303	movss	(%r15), %xmm1
000000000008c308	movss	0x4(%r15), %xmm2
000000000008c30e	movss	0x8(%r15), %xmm3
000000000008c314	movq	(%rdi), %rax
000000000008c317	movl	$0x1, %esi
000000000008c31c	callq	*0x60(%rax)
000000000008c31f	movq	(%rbx), %rax
000000000008c322	leaq	-0x80(%rbp), %rdx
000000000008c326	movq	%rbx, %rdi
000000000008c329	movl	$0x2, %esi
000000000008c32e	callq	*0x68(%rax)
000000000008c331	movq	(%r14), %rdi
000000000008c334	movss	-0x80(%rbp), %xmm0
000000000008c339	movss	(%r15), %xmm1
000000000008c33e	movss	0x4(%r15), %xmm2
000000000008c344	movss	0x8(%r15), %xmm3
000000000008c34a	movq	(%rdi), %rax
000000000008c34d	movl	$0x2, %esi
000000000008c352	callq	*0x60(%rax)
000000000008c355	movq	(%rbx), %rax
000000000008c358	leaq	-0x80(%rbp), %rdx
000000000008c35c	movq	%rbx, %rdi
000000000008c35f	movl	$0x3, %esi
000000000008c364	callq	*0x68(%rax)
000000000008c367	movq	(%r14), %rdi
000000000008c36a	movss	-0x80(%rbp), %xmm0
000000000008c36f	movss	(%r15), %xmm1
000000000008c374	movss	0x4(%r15), %xmm2
000000000008c37a	movss	0x8(%r15), %xmm3
000000000008c380	movq	(%rdi), %rax
000000000008c383	movl	$0x3, %esi
000000000008c388	callq	*0x60(%rax)
000000000008c38b	movq	(%rbx), %rax
000000000008c38e	leaq	-0x80(%rbp), %rdx
000000000008c392	movq	%rbx, %rdi
000000000008c395	movl	$0x4, %esi
000000000008c39a	callq	*0x68(%rax)
000000000008c39d	movq	(%r14), %rdi
000000000008c3a0	movss	-0x80(%rbp), %xmm0
000000000008c3a5	movss	(%r15), %xmm1
000000000008c3aa	movss	0x4(%r15), %xmm2
000000000008c3b0	movss	0x8(%r15), %xmm3
000000000008c3b6	movq	(%rdi), %rax
000000000008c3b9	movl	$0x4, %esi
000000000008c3be	callq	*0x60(%rax)
000000000008c3c1	movq	(%rbx), %rax
000000000008c3c4	leaq	-0x80(%rbp), %rdx
000000000008c3c8	movq	%rbx, %rdi
000000000008c3cb	movl	$0x5, %esi
000000000008c3d0	callq	*0x68(%rax)
000000000008c3d3	movq	(%r14), %rdi
000000000008c3d6	movss	-0x80(%rbp), %xmm0
000000000008c3db	movss	(%r15), %xmm1
000000000008c3e0	movss	0x4(%r15), %xmm2
000000000008c3e6	movss	0x8(%r15), %xmm3
000000000008c3ec	movq	(%rdi), %rax
000000000008c3ef	movl	$0x5, %esi
000000000008c3f4	callq	*0x60(%rax)
000000000008c3f7	movq	(%rbx), %rax
000000000008c3fa	leaq	-0x80(%rbp), %rdx
000000000008c3fe	movq	%rbx, %rdi
000000000008c401	movl	$0x6, %esi
000000000008c406	callq	*0x68(%rax)
000000000008c409	movq	(%r14), %rdi
000000000008c40c	movss	-0x80(%rbp), %xmm0
000000000008c411	movss	(%r15), %xmm1
000000000008c416	movss	0x4(%r15), %xmm2
000000000008c41c	movss	0x8(%r15), %xmm3
000000000008c422	movq	(%rdi), %rax
000000000008c425	movl	$0x6, %esi
000000000008c42a	callq	*0x60(%rax)
000000000008c42d	movq	(%r14), %rax
000000000008c430	jmp	0x8c5e8
000000000008c435	movq	(%r14), %rax
000000000008c438	movq	%r14, %rdi
000000000008c43b	callq	*0x18(%rax)
000000000008c43e	movq	0x1a0(%rbx), %r14
000000000008c445	movq	(%r14), %rax
000000000008c448	movq	%r14, %rdi
000000000008c44b	xorl	%esi, %esi
000000000008c44d	movq	%r15, %rdx
000000000008c450	callq	*0x78(%rax)
000000000008c453	movq	(%rbx), %rax
000000000008c456	leaq	-0x40(%rbp), %rdx
000000000008c45a	movq	%rbx, %rdi
000000000008c45d	xorl	%esi, %esi
000000000008c45f	callq	*0x68(%rax)
000000000008c462	movq	0x1a0(%rbx), %rdi
000000000008c469	movss	-0x40(%rbp), %xmm0
000000000008c46e	movss	-0x3c(%rbp), %xmm1
000000000008c473	movss	-0x38(%rbp), %xmm2
000000000008c478	movss	-0x34(%rbp), %xmm3
000000000008c47d	movq	(%rdi), %rax
000000000008c480	xorl	%esi, %esi
000000000008c482	callq	*0x60(%rax)
000000000008c485	movq	(%rbx), %rax
000000000008c488	leaq	-0x40(%rbp), %rdx
000000000008c48c	movq	%rbx, %rdi
000000000008c48f	movl	$0x1, %esi
000000000008c494	callq	*0x68(%rax)
000000000008c497	movq	0x1a0(%rbx), %rdi
000000000008c49e	movss	-0x40(%rbp), %xmm0
000000000008c4a3	movss	-0x3c(%rbp), %xmm1
000000000008c4a8	movss	-0x38(%rbp), %xmm2
000000000008c4ad	movss	-0x34(%rbp), %xmm3
000000000008c4b2	movq	(%rdi), %rax
000000000008c4b5	movl	$0x1, %esi
000000000008c4ba	callq	*0x60(%rax)
000000000008c4bd	movq	(%rbx), %rax
000000000008c4c0	leaq	-0x40(%rbp), %rdx
000000000008c4c4	movq	%rbx, %rdi
000000000008c4c7	movl	$0x2, %esi
000000000008c4cc	callq	*0x68(%rax)
000000000008c4cf	movq	0x1a0(%rbx), %rdi
000000000008c4d6	movss	-0x40(%rbp), %xmm0
000000000008c4db	movss	-0x3c(%rbp), %xmm1
000000000008c4e0	movss	-0x38(%rbp), %xmm2
000000000008c4e5	movss	-0x34(%rbp), %xmm3
000000000008c4ea	movq	(%rdi), %rax
000000000008c4ed	movl	$0x2, %esi
000000000008c4f2	callq	*0x60(%rax)
000000000008c4f5	movq	(%rbx), %rax
000000000008c4f8	leaq	-0x40(%rbp), %rdx
000000000008c4fc	movq	%rbx, %rdi
000000000008c4ff	movl	$0x3, %esi
000000000008c504	callq	*0x68(%rax)
000000000008c507	movq	0x1a0(%rbx), %rdi
000000000008c50e	movss	-0x40(%rbp), %xmm0
000000000008c513	movss	-0x3c(%rbp), %xmm1
000000000008c518	movss	-0x38(%rbp), %xmm2
000000000008c51d	movss	-0x34(%rbp), %xmm3
000000000008c522	movq	(%rdi), %rax
000000000008c525	movl	$0x3, %esi
000000000008c52a	callq	*0x60(%rax)
000000000008c52d	movq	(%rbx), %rax
000000000008c530	leaq	-0x40(%rbp), %rdx
000000000008c534	movq	%rbx, %rdi
000000000008c537	movl	$0x4, %esi
000000000008c53c	callq	*0x68(%rax)
000000000008c53f	movq	0x1a0(%rbx), %rdi
000000000008c546	movss	-0x40(%rbp), %xmm0
000000000008c54b	movss	-0x3c(%rbp), %xmm1
000000000008c550	movss	-0x38(%rbp), %xmm2
000000000008c555	movss	-0x34(%rbp), %xmm3
000000000008c55a	movq	(%rdi), %rax
000000000008c55d	movl	$0x4, %esi
000000000008c562	callq	*0x60(%rax)
000000000008c565	movq	(%rbx), %rax
000000000008c568	leaq	-0x40(%rbp), %rdx
000000000008c56c	movq	%rbx, %rdi
000000000008c56f	movl	$0x5, %esi
000000000008c574	callq	*0x68(%rax)
000000000008c577	movq	0x1a0(%rbx), %rdi
000000000008c57e	movss	-0x40(%rbp), %xmm0
000000000008c583	movss	-0x3c(%rbp), %xmm1
000000000008c588	movss	-0x38(%rbp), %xmm2
000000000008c58d	movss	-0x34(%rbp), %xmm3
000000000008c592	movq	(%rdi), %rax
000000000008c595	movl	$0x5, %esi
000000000008c59a	callq	*0x60(%rax)
000000000008c59d	movq	(%rbx), %rax
000000000008c5a0	leaq	-0x40(%rbp), %rdx
000000000008c5a4	movq	%rbx, %rdi
000000000008c5a7	movl	$0x6, %esi
000000000008c5ac	callq	*0x68(%rax)
000000000008c5af	movq	0x1a0(%rbx), %rdi
000000000008c5b6	movss	-0x40(%rbp), %xmm0
000000000008c5bb	movss	-0x3c(%rbp), %xmm1
000000000008c5c0	movss	-0x38(%rbp), %xmm2
000000000008c5c5	movss	-0x34(%rbp), %xmm3
000000000008c5ca	movq	(%rdi), %rax
000000000008c5cd	movl	$0x6, %esi
000000000008c5d2	callq	*0x60(%rax)
000000000008c5d5	movq	0x1a0(%rbx), %rbx
000000000008c5dc	movq	(%r15), %rax
000000000008c5df	movq	%r15, %rdi
000000000008c5e2	callq	*0x18(%rax)
000000000008c5e5	movq	%rbx, %rax
000000000008c5e8	movq	0x975c69(%rip), %rcx            ## literal pool symbol address: ___stack_chk_guard
000000000008c5ef	movq	(%rcx), %rcx
000000000008c5f2	cmpq	-0x30(%rbp), %rcx
000000000008c5f6	jne	0x8c663
000000000008c5f8	addq	$0x58, %rsp
000000000008c5fc	popq	%rbx
000000000008c5fd	popq	%r12
000000000008c5ff	popq	%r13
000000000008c601	popq	%r14
000000000008c603	popq	%r15
000000000008c605	popq	%rbp
000000000008c606	retq
000000000008c607	testq	%r15, %r15
000000000008c60a	je	0x8c29e
000000000008c610	movq	(%r15), %rax
000000000008c613	movq	%r15, %rdi
000000000008c616	callq	*0x18(%rax)
000000000008c619	jmp	0x8c29e
000000000008c61e	testq	%r15, %r15
000000000008c621	je	0x8c29e
000000000008c627	movq	(%r15), %rax
000000000008c62a	movq	%r15, %rdi
000000000008c62d	callq	*0x18(%rax)
000000000008c630	jmp	0x8c29e
000000000008c635	testq	%r15, %r15
000000000008c638	je	0x8c29e
000000000008c63e	movq	(%r15), %rax
000000000008c641	movq	%r15, %rdi
000000000008c644	callq	*0x18(%rax)
000000000008c647	jmp	0x8c29e
000000000008c64c	testq	%r15, %r15
000000000008c64f	je	0x8c29e
000000000008c655	movq	(%r15), %rax
000000000008c658	movq	%r15, %rdi
000000000008c65b	callq	*0x18(%rax)
000000000008c65e	jmp	0x8c29e
000000000008c663	callq	0x3c5030                        ## symbol stub for: ___stack_chk_fail
000000000008c668	jmp	0x8c76e
000000000008c66d	jmp	0x8c76e
000000000008c672	jmp	0x8c76e
000000000008c677	jmp	0x8c76e
000000000008c67c	movq	%rax, %rbx
000000000008c67f	testq	%r15, %r15
000000000008c682	je	0x8c780
000000000008c688	movq	(%r15), %rax
000000000008c68b	movq	%r15, %rdi
000000000008c68e	callq	*0x18(%rax)
000000000008c691	jmp	0x8c780
000000000008c696	jmp	0x8c76e
000000000008c69b	movq	%rax, %rbx
000000000008c69e	testq	%r15, %r15
000000000008c6a1	je	0x8c780
000000000008c6a7	movq	(%r15), %rax
000000000008c6aa	movq	%r15, %rdi
000000000008c6ad	callq	*0x18(%rax)
000000000008c6b0	jmp	0x8c780
000000000008c6b5	jmp	0x8c76e
000000000008c6ba	movq	%rax, %rbx
000000000008c6bd	testq	%r15, %r15
000000000008c6c0	je	0x8c780
000000000008c6c6	movq	(%r15), %rax
000000000008c6c9	movq	%r15, %rdi
000000000008c6cc	callq	*0x18(%rax)
000000000008c6cf	jmp	0x8c780
000000000008c6d4	jmp	0x8c76e
000000000008c6d9	movq	%rax, %rbx
000000000008c6dc	testq	%r15, %r15
000000000008c6df	je	0x8c780
000000000008c6e5	movq	(%r15), %rax
000000000008c6e8	movq	%r15, %rdi
000000000008c6eb	callq	*0x18(%rax)
000000000008c6ee	jmp	0x8c780
000000000008c6f3	jmp	0x8c76e
000000000008c6f5	jmp	0x8c76e
000000000008c6f7	movq	%rax, %rbx
000000000008c6fa	movq	(%r14), %rax
000000000008c6fd	movq	%r14, %rdi
000000000008c700	callq	*0x18(%rax)
000000000008c703	jmp	0x8c763
000000000008c705	jmp	0x8c76e
000000000008c707	jmp	0x8c741
000000000008c709	jmp	0x8c741
000000000008c70b	jmp	0x8c741
000000000008c70d	jmp	0x8c741
000000000008c70f	jmp	0x8c76e
000000000008c711	movq	%rax, %rbx
000000000008c714	movq	0x1a0(%r14), %rdi
000000000008c71b	testq	%rdi, %rdi
000000000008c71e	je	0x8c726
000000000008c720	movq	(%rdi), %rax
000000000008c723	callq	*0x18(%rax)
000000000008c726	movq	%r14, %rdi
000000000008c729	callq	__ZN6HGNodeD2Ev                 ## HGNode::~HGNode()
000000000008c72e	jmp	0x8c735
000000000008c730	jmp	0x8c76e
000000000008c732	movq	%rax, %rbx
000000000008c735	movq	%r14, %rdi
000000000008c738	callq	__ZN8HGObjectdlEPv              ## HGObject::operator delete(void*)
000000000008c73d	jmp	0x8c763
000000000008c73f	jmp	0x8c760
000000000008c741	movq	%rax, %rbx
000000000008c744	movq	%r15, %rdi
000000000008c747	callq	__ZN8HGObjectdlEPv              ## HGObject::operator delete(void*)
000000000008c74c	movq	%rbx, %rdi
000000000008c74f	callq	0x3c4e02                        ## symbol stub for: __Unwind_Resume
000000000008c754	jmp	0x8c756
000000000008c756	movq	%rax, %rbx
000000000008c759	testq	%r15, %r15
000000000008c75c	jne	0x8c763
000000000008c75e	jmp	0x8c780
000000000008c760	movq	%rax, %rbx
000000000008c763	movq	(%r15), %rax
000000000008c766	movq	%r15, %rdi
000000000008c769	callq	*0x18(%rax)
000000000008c76c	jmp	0x8c780
000000000008c76e	movq	%rax, %rbx
000000000008c771	testl	%edx, %edx
000000000008c773	je	0x8c780
000000000008c775	movq	%rbx, %rdi
000000000008c778	callq	___clang_call_terminate
000000000008c77d	movq	%rax, %rbx
000000000008c780	movq	%rbx, %rdi
000000000008c783	callq	0x3c4e02                        ## symbol stub for: __Unwind_Resume
000000000008c788	addr32		stc
000000000008c78a	.byte 0xff #bad opcode
000000000008c78b	.byte 0xff #bad opcode
000000000008c78c	.byte 0xdf #bad opcode
000000000008c78d	cli
000000000008c78e	.byte 0xff #bad opcode
000000000008c78f	.byte 0xff #bad opcode
000000000008c790	jnp	0x8c78c
000000000008c792	.byte 0xff #bad opcode
000000000008c793	ljmpl	*0xffffffa(%rbp)
000000000008c799	.byte 0x1f #bad opcode
000000000008c79a	testb	%al, (%rax)
000000000008c79c	addb	%al, (%rax)
000000000008c79e	addb	%al, (%rax)
