__ZN14HGColorConform15ConvertRGBColorEP12CGColorSpaceS1_RNSt3__16vectorIfNS2_9allocatorIfEEEE:
00000000001cccf0	pushq	%rbp
00000000001cccf1	movq	%rsp, %rbp
00000000001cccf4	pushq	%r15
00000000001cccf6	pushq	%r14
00000000001cccf8	pushq	%r13
00000000001cccfa	pushq	%r12
00000000001cccfc	pushq	%rbx
00000000001cccfd	subq	$0x58, %rsp
00000000001ccd01	movq	%rdx, %r14
00000000001ccd04	movq	%rsi, %r15
00000000001ccd07	movq	%rdi, %r13
00000000001ccd0a	callq	0x3c4afc                        ## symbol stub for: _CFEqual
00000000001ccd0f	movb	$0x1, %bl
00000000001ccd11	testb	%al, %al
00000000001ccd13	jne	0x1cd685
00000000001ccd19	leaq	__ZL35hgColorConformNodeListCacheLockInit(%rip), %rdi ## hgColorConformNodeListCacheLockInit
00000000001ccd20	leaq	__Z43hgColorConformNodeListCacheLockInitFunctionv(%rip), %rsi ## hgColorConformNodeListCacheLockInitFunction()
00000000001ccd27	callq	0x3c5576                        ## symbol stub for: _pthread_once
00000000001ccd2c	movq	$0x0, -0x78(%rbp)
00000000001ccd34	movq	__ZN14HGColorConform19s_NodeListCacheLockE(%rip), %r12 ## HGColorConform::s_NodeListCacheLock
00000000001ccd3b	movq	%r12, -0x70(%rbp)
00000000001ccd3f	movb	$0x0, -0x68(%rbp)
00000000001ccd43	movq	%r12, %rdi
00000000001ccd46	callq	__ZN16HGSynchronizable4LockEv   ## HGSynchronizable::Lock()
00000000001ccd4b	leaq	-0x78(%rbp), %rdx
00000000001ccd4f	movq	%r13, %rdi
00000000001ccd52	movq	%r15, %rsi
00000000001ccd55	callq	__ZN14HGColorConform19SetConversionStaticEP12CGColorSpaceS1_PP31HGColorConformNodeListCacheItem ## HGColorConform::SetConversionStatic(CGColorSpace*, CGColorSpace*, HGColorConformNodeListCacheItem**)
00000000001ccd5a	movl	%eax, %ebx
00000000001ccd5c	movq	-0x78(%rbp), %r15
00000000001ccd60	testq	%r15, %r15
00000000001ccd63	setne	%al
00000000001ccd66	andb	%al, %bl
00000000001ccd68	cmpb	$0x1, %bl
00000000001ccd6b	jne	0x1cd64e
00000000001ccd71	movq	(%r15), %rax
00000000001ccd74	movq	%r15, %rdi
00000000001ccd77	callq	*0x10(%rax)
00000000001ccd7a	movb	%bl, -0x29(%rbp)
00000000001ccd7d	movq	%r12, %rdi
00000000001ccd80	callq	__ZN16HGSynchronizable6UnlockEv ## HGSynchronizable::Unlock()
00000000001ccd85	movq	%r15, -0x80(%rbp)
00000000001ccd89	movq	0x10(%r15), %r13
00000000001ccd8d	movq	0x8(%r13), %r15
00000000001ccd91	subq	(%r13), %r15
00000000001ccd95	shrq	$0x3, %r15
00000000001ccd99	testl	%r15d, %r15d
00000000001ccd9c	jle	0x1cd658
00000000001ccda2	andl	$0x7fffffff, %r15d              ## imm = 0x7FFFFFFF
00000000001ccda9	xorl	%ebx, %ebx
00000000001ccdab	movaps	0x1fd31e(%rip), %xmm5
00000000001ccdb2	movq	%r14, -0x48(%rbp)
00000000001ccdb6	jmp	0x1ccdfc
00000000001ccdb8	mulss	0x88(%r12), %xmm1
00000000001ccdc2	nopw	%cs:(%rax,%rax)
00000000001ccdd0	movaps	%xmm1, %xmm2
00000000001ccdd3	xorps	%xmm5, %xmm2
00000000001ccdd6	xorps	%xmm0, %xmm0
00000000001ccdd9	cmpltss	%xmm0, %xmm6
00000000001ccdde	movaps	%xmm6, %xmm0
00000000001ccde1	blendvps	%xmm0, %xmm2, %xmm1
00000000001ccde6	movss	%xmm1, 0x8(%r14)
00000000001ccdec	movq	-0x48(%rbp), %r14
00000000001ccdf0	incq	%rbx
00000000001ccdf3	cmpq	%rbx, %r15
00000000001ccdf6	je	0x1cd658
00000000001ccdfc	movq	(%r13), %rax
00000000001cce00	movq	0x8(%r13), %rcx
00000000001cce04	subq	%rax, %rcx
00000000001cce07	sarq	$0x3, %rcx
00000000001cce0b	cmpq	%rbx, %rcx
00000000001cce0e	jbe	0x1cd696
00000000001cce14	movq	(%rax,%rbx,8), %r12
00000000001cce18	movl	(%r12), %eax
00000000001cce1c	decl	%eax
00000000001cce1e	cmpl	$0x5, %eax
00000000001cce21	ja	0x1ccdf0
00000000001cce23	leaq	0x8ba(%rip), %rcx
00000000001cce2a	movslq	(%rcx,%rax,4), %rax
00000000001cce2e	addq	%rcx, %rax
00000000001cce31	jmpq	*%rax
00000000001cce33	movl	$0xc, %edi
00000000001cce38	callq	0x3c4fb2                        ## symbol stub for: __Znwm
00000000001cce3d	movq	%rax, %r12
00000000001cce40	movq	$0x0, (%rax)
00000000001cce47	movl	$0x0, 0x8(%rax)
00000000001cce4e	movq	(%r13), %rcx
00000000001cce52	movq	0x8(%r13), %rax
00000000001cce56	subq	%rcx, %rax
00000000001cce59	sarq	$0x3, %rax
00000000001cce5d	cmpq	%rbx, %rax
00000000001cce60	jbe	0x1cd69b
00000000001cce66	movq	(%r14), %rax
00000000001cce69	movq	(%rcx,%rbx,8), %rcx
00000000001cce6d	movss	(%rax), %xmm1
00000000001cce71	movss	0x4(%rax), %xmm2
00000000001cce76	movss	0x8(%rax), %xmm0
00000000001cce7b	mulss	0x10(%rcx), %xmm1
00000000001cce80	mulss	0x14(%rcx), %xmm2
00000000001cce85	addss	%xmm1, %xmm2
00000000001cce89	mulss	0x18(%rcx), %xmm0
00000000001cce8e	addss	%xmm2, %xmm0
00000000001cce92	addss	0x1c(%rcx), %xmm0
00000000001cce97	movss	%xmm0, (%r12)
00000000001cce9d	movss	(%rax), %xmm1
00000000001ccea1	movss	0x4(%rax), %xmm2
00000000001ccea6	movss	0x8(%rax), %xmm3
00000000001cceab	mulss	0x20(%rcx), %xmm1
00000000001cceb0	mulss	0x24(%rcx), %xmm2
00000000001cceb5	mulss	0x28(%rcx), %xmm3
00000000001cceba	addss	%xmm1, %xmm2
00000000001ccebe	addss	%xmm2, %xmm3
00000000001ccec2	addss	0x2c(%rcx), %xmm3
00000000001ccec7	movss	%xmm3, 0x4(%r12)
00000000001ccece	movss	(%rax), %xmm1
00000000001cced2	movss	0x4(%rax), %xmm2
00000000001cced7	movss	0x8(%rax), %xmm3
00000000001ccedc	mulss	0x30(%rcx), %xmm1
00000000001ccee1	mulss	0x34(%rcx), %xmm2
00000000001ccee6	addss	%xmm1, %xmm2
00000000001cceea	mulss	0x38(%rcx), %xmm3
00000000001cceef	addss	%xmm2, %xmm3
00000000001ccef3	addss	0x3c(%rcx), %xmm3
00000000001ccef8	movss	%xmm3, 0x8(%r12)
00000000001cceff	movss	%xmm0, (%rax)
00000000001ccf03	movss	0x4(%r12), %xmm0
00000000001ccf0a	movss	%xmm0, 0x4(%rax)
00000000001ccf0f	movss	0x8(%r12), %xmm0
00000000001ccf16	movss	%xmm0, 0x8(%rax)
00000000001ccf1b	movq	%r12, %rdi
00000000001ccf1e	callq	0x3c4fa0                        ## symbol stub for: __ZdlPv
00000000001ccf23	movaps	0x1fd1a6(%rip), %xmm5
00000000001ccf2a	jmp	0x1ccdf0
00000000001ccf2f	movq	(%r14), %r14
00000000001ccf32	movss	0x60(%r12), %xmm2
00000000001ccf39	movss	0x70(%r12), %xmm0
00000000001ccf40	movss	0x90(%r12), %xmm3
00000000001ccf4a	movss	(%r14), %xmm6
00000000001ccf4f	xorps	%xmm1, %xmm1
00000000001ccf52	ucomiss	%xmm6, %xmm1
00000000001ccf55	movaps	%xmm6, %xmm1
00000000001ccf58	jbe	0x1ccf65
00000000001ccf5a	movaps	%xmm6, %xmm1
00000000001ccf5d	xorps	%xmm5, %xmm1
00000000001ccf60	movss	%xmm1, (%r14)
00000000001ccf65	ucomiss	%xmm1, %xmm3
00000000001ccf68	jbe	0x1cd2fb
00000000001ccf6e	mulss	0x80(%r12), %xmm1
00000000001ccf78	jmp	0x1cd321
00000000001ccf7d	movq	(%r14), %r14
00000000001ccf80	movss	0x60(%r12), %xmm2
00000000001ccf87	movss	0x70(%r12), %xmm0
00000000001ccf8e	movss	(%r14), %xmm6
00000000001ccf93	xorps	%xmm1, %xmm1
00000000001ccf96	ucomiss	%xmm6, %xmm1
00000000001ccf99	movaps	%xmm6, %xmm3
00000000001ccf9c	jbe	0x1ccfa9
00000000001ccf9e	movaps	%xmm6, %xmm3
00000000001ccfa1	xorps	%xmm5, %xmm3
00000000001ccfa4	movss	%xmm3, (%r14)
00000000001ccfa9	movaps	%xmm0, %xmm4
00000000001ccfac	xorps	%xmm5, %xmm4
00000000001ccfaf	divss	%xmm2, %xmm4
00000000001ccfb3	ucomiss	%xmm3, %xmm4
00000000001ccfb6	ja	0x1ccfde
00000000001ccfb8	mulss	%xmm3, %xmm2
00000000001ccfbc	addss	%xmm2, %xmm0
00000000001ccfc0	movss	0x50(%r12), %xmm1
00000000001ccfc7	movaps	%xmm6, -0x40(%rbp)
00000000001ccfcb	callq	0x3c54f2                        ## symbol stub for: _powf
00000000001ccfd0	movaps	-0x40(%rbp), %xmm6
00000000001ccfd4	movaps	0x1fd0f5(%rip), %xmm5
00000000001ccfdb	movaps	%xmm0, %xmm1
00000000001ccfde	movaps	%xmm1, %xmm2
00000000001ccfe1	xorps	%xmm5, %xmm2
00000000001ccfe4	xorps	%xmm3, %xmm3
00000000001ccfe7	cmpltss	%xmm3, %xmm6
00000000001ccfec	movaps	%xmm6, %xmm0
00000000001ccfef	blendvps	%xmm0, %xmm2, %xmm1
00000000001ccff4	movss	%xmm1, (%r14)
00000000001ccff9	movss	0x64(%r12), %xmm2
00000000001cd000	movss	0x74(%r12), %xmm0
00000000001cd007	movss	0x4(%r14), %xmm6
00000000001cd00d	ucomiss	%xmm6, %xmm3
00000000001cd010	movaps	%xmm6, %xmm3
00000000001cd013	jbe	0x1cd021
00000000001cd015	movaps	%xmm6, %xmm3
00000000001cd018	xorps	%xmm5, %xmm3
00000000001cd01b	movss	%xmm3, 0x4(%r14)
00000000001cd021	movaps	%xmm0, %xmm4
00000000001cd024	xorps	%xmm5, %xmm4
00000000001cd027	divss	%xmm2, %xmm4
00000000001cd02b	xorps	%xmm1, %xmm1
00000000001cd02e	ucomiss	%xmm3, %xmm4
00000000001cd031	ja	0x1cd059
00000000001cd033	mulss	%xmm3, %xmm2
00000000001cd037	addss	%xmm2, %xmm0
00000000001cd03b	movss	0x54(%r12), %xmm1
00000000001cd042	movaps	%xmm6, -0x40(%rbp)
00000000001cd046	callq	0x3c54f2                        ## symbol stub for: _powf
00000000001cd04b	movaps	-0x40(%rbp), %xmm6
00000000001cd04f	movaps	0x1fd07a(%rip), %xmm5
00000000001cd056	movaps	%xmm0, %xmm1
00000000001cd059	movaps	%xmm1, %xmm2
00000000001cd05c	xorps	%xmm5, %xmm2
00000000001cd05f	xorps	%xmm3, %xmm3
00000000001cd062	cmpltss	%xmm3, %xmm6
00000000001cd067	movaps	%xmm6, %xmm0
00000000001cd06a	blendvps	%xmm0, %xmm2, %xmm1
00000000001cd06f	movss	%xmm1, 0x4(%r14)
00000000001cd075	movss	0x68(%r12), %xmm2
00000000001cd07c	movss	0x78(%r12), %xmm0
00000000001cd083	movss	0x8(%r14), %xmm6
00000000001cd089	ucomiss	%xmm6, %xmm3
00000000001cd08c	movaps	%xmm6, %xmm3
00000000001cd08f	jbe	0x1cd09d
00000000001cd091	movaps	%xmm6, %xmm3
00000000001cd094	xorps	%xmm5, %xmm3
00000000001cd097	movss	%xmm3, 0x8(%r14)
00000000001cd09d	movaps	%xmm0, %xmm4
00000000001cd0a0	xorps	%xmm5, %xmm4
00000000001cd0a3	divss	%xmm2, %xmm4
00000000001cd0a7	xorps	%xmm1, %xmm1
00000000001cd0aa	ucomiss	%xmm3, %xmm4
00000000001cd0ad	ja	0x1ccdd0
00000000001cd0b3	mulss	%xmm3, %xmm2
00000000001cd0b7	jmp	0x1cd400
00000000001cd0bc	movq	(%r14), %r14
00000000001cd0bf	movss	0x60(%r12), %xmm1
00000000001cd0c6	movss	0x70(%r12), %xmm0
00000000001cd0cd	movss	0x80(%r12), %xmm4
00000000001cd0d7	movss	(%r14), %xmm6
00000000001cd0dc	xorps	%xmm2, %xmm2
00000000001cd0df	ucomiss	%xmm6, %xmm2
00000000001cd0e2	movaps	%xmm6, %xmm2
00000000001cd0e5	jbe	0x1cd0f2
00000000001cd0e7	movaps	%xmm6, %xmm2
00000000001cd0ea	xorps	%xmm5, %xmm2
00000000001cd0ed	movss	%xmm2, (%r14)
00000000001cd0f2	movaps	%xmm0, %xmm3
00000000001cd0f5	xorps	%xmm5, %xmm3
00000000001cd0f8	divss	%xmm1, %xmm3
00000000001cd0fc	ucomiss	%xmm2, %xmm3
00000000001cd0ff	ja	0x1cd130
00000000001cd101	mulss	%xmm2, %xmm1
00000000001cd105	addss	%xmm1, %xmm0
00000000001cd109	movss	0x50(%r12), %xmm1
00000000001cd110	movaps	%xmm4, -0x40(%rbp)
00000000001cd114	movaps	%xmm6, -0x60(%rbp)
00000000001cd118	callq	0x3c54f2                        ## symbol stub for: _powf
00000000001cd11d	movaps	-0x60(%rbp), %xmm6
00000000001cd121	movaps	-0x40(%rbp), %xmm4
00000000001cd125	movaps	0x1fcfa4(%rip), %xmm5
00000000001cd12c	addss	%xmm0, %xmm4
00000000001cd130	movaps	%xmm4, %xmm1
00000000001cd133	xorps	%xmm5, %xmm1
00000000001cd136	xorps	%xmm2, %xmm2
00000000001cd139	cmpltss	%xmm2, %xmm6
00000000001cd13e	movaps	%xmm6, %xmm0
00000000001cd141	blendvps	%xmm0, %xmm1, %xmm4
00000000001cd146	movss	%xmm4, (%r14)
00000000001cd14b	movss	0x64(%r12), %xmm1
00000000001cd152	movss	0x74(%r12), %xmm0
00000000001cd159	movss	0x84(%r12), %xmm4
00000000001cd163	movss	0x4(%r14), %xmm6
00000000001cd169	ucomiss	%xmm6, %xmm2
00000000001cd16c	movaps	%xmm6, %xmm2
00000000001cd16f	jbe	0x1cd17d
00000000001cd171	movaps	%xmm6, %xmm2
00000000001cd174	xorps	%xmm5, %xmm2
00000000001cd177	movss	%xmm2, 0x4(%r14)
00000000001cd17d	movaps	%xmm0, %xmm3
00000000001cd180	xorps	%xmm5, %xmm3
00000000001cd183	divss	%xmm1, %xmm3
00000000001cd187	ucomiss	%xmm2, %xmm3
00000000001cd18a	ja	0x1cd1bb
00000000001cd18c	mulss	%xmm2, %xmm1
00000000001cd190	addss	%xmm1, %xmm0
00000000001cd194	movss	0x54(%r12), %xmm1
00000000001cd19b	movaps	%xmm4, -0x40(%rbp)
00000000001cd19f	movaps	%xmm6, -0x60(%rbp)
00000000001cd1a3	callq	0x3c54f2                        ## symbol stub for: _powf
00000000001cd1a8	movaps	-0x60(%rbp), %xmm6
00000000001cd1ac	movaps	-0x40(%rbp), %xmm4
00000000001cd1b0	movaps	0x1fcf19(%rip), %xmm5
00000000001cd1b7	addss	%xmm0, %xmm4
00000000001cd1bb	movaps	%xmm4, %xmm1
00000000001cd1be	xorps	%xmm5, %xmm1
00000000001cd1c1	xorps	%xmm2, %xmm2
00000000001cd1c4	cmpltss	%xmm2, %xmm6
00000000001cd1c9	movaps	%xmm6, %xmm0
00000000001cd1cc	blendvps	%xmm0, %xmm1, %xmm4
00000000001cd1d1	movss	%xmm4, 0x4(%r14)
00000000001cd1d7	movss	0x68(%r12), %xmm1
00000000001cd1de	movss	0x78(%r12), %xmm0
00000000001cd1e5	movss	0x88(%r12), %xmm4
00000000001cd1ef	movss	0x8(%r14), %xmm6
00000000001cd1f5	ucomiss	%xmm6, %xmm2
00000000001cd1f8	movaps	%xmm6, %xmm2
00000000001cd1fb	jbe	0x1cd209
00000000001cd1fd	movaps	%xmm6, %xmm2
00000000001cd200	xorps	%xmm5, %xmm2
00000000001cd203	movss	%xmm2, 0x8(%r14)
00000000001cd209	movaps	%xmm0, %xmm3
00000000001cd20c	xorps	%xmm5, %xmm3
00000000001cd20f	divss	%xmm1, %xmm3
00000000001cd213	ucomiss	%xmm2, %xmm3
00000000001cd216	ja	0x1cd247
00000000001cd218	mulss	%xmm2, %xmm1
00000000001cd21c	addss	%xmm1, %xmm0
00000000001cd220	movss	0x58(%r12), %xmm1
00000000001cd227	movaps	%xmm4, -0x40(%rbp)
00000000001cd22b	movaps	%xmm6, -0x60(%rbp)
00000000001cd22f	callq	0x3c54f2                        ## symbol stub for: _powf
00000000001cd234	movaps	-0x60(%rbp), %xmm6
00000000001cd238	movaps	-0x40(%rbp), %xmm4
00000000001cd23c	movaps	0x1fce8d(%rip), %xmm5
00000000001cd243	addss	%xmm0, %xmm4
00000000001cd247	movaps	%xmm4, %xmm1
00000000001cd24a	xorps	%xmm5, %xmm1
00000000001cd24d	xorps	%xmm0, %xmm0
00000000001cd250	cmpltss	%xmm0, %xmm6
00000000001cd255	movaps	%xmm6, %xmm0
00000000001cd258	blendvps	%xmm0, %xmm1, %xmm4
00000000001cd25d	movss	%xmm4, 0x8(%r14)
00000000001cd263	jmp	0x1ccdec
00000000001cd268	movq	(%r14), %r14
00000000001cd26b	movss	(%r14), %xmm0
00000000001cd270	xorps	%xmm1, %xmm1
00000000001cd273	ucomiss	%xmm0, %xmm1
00000000001cd276	jbe	0x1cd427
00000000001cd27c	xorps	%xmm5, %xmm0
00000000001cd27f	movss	%xmm0, (%r14)
00000000001cd284	movss	0x50(%r12), %xmm1
00000000001cd28b	callq	0x3c54f2                        ## symbol stub for: _powf
00000000001cd290	movaps	0x1fce39(%rip), %xmm2
00000000001cd297	xorps	%xmm2, %xmm0
00000000001cd29a	jmp	0x1cd43a
00000000001cd29f	movq	(%r14), %r14
00000000001cd2a2	movss	0x60(%r12), %xmm2
00000000001cd2a9	movss	0x70(%r12), %xmm0
00000000001cd2b0	movss	0x80(%r12), %xmm1
00000000001cd2ba	movss	0x90(%r12), %xmm4
00000000001cd2c4	movss	(%r14), %xmm6
00000000001cd2c9	xorps	%xmm3, %xmm3
00000000001cd2cc	ucomiss	%xmm6, %xmm3
00000000001cd2cf	movaps	%xmm6, %xmm3
00000000001cd2d2	jbe	0x1cd2df
00000000001cd2d4	movaps	%xmm6, %xmm3
00000000001cd2d7	xorps	%xmm5, %xmm3
00000000001cd2da	movss	%xmm3, (%r14)
00000000001cd2df	ucomiss	%xmm3, %xmm4
00000000001cd2e2	jbe	0x1cd4dd
00000000001cd2e8	mulss	%xmm3, %xmm1
00000000001cd2ec	addss	0xb0(%r12), %xmm1
00000000001cd2f6	jmp	0x1cd50d
00000000001cd2fb	mulss	%xmm1, %xmm2
00000000001cd2ff	addss	%xmm2, %xmm0
00000000001cd303	movss	0x50(%r12), %xmm1
00000000001cd30a	movaps	%xmm6, -0x40(%rbp)
00000000001cd30e	callq	0x3c54f2                        ## symbol stub for: _powf
00000000001cd313	movaps	-0x40(%rbp), %xmm6
00000000001cd317	movaps	0x1fcdb2(%rip), %xmm5
00000000001cd31e	movaps	%xmm0, %xmm1
00000000001cd321	movaps	%xmm1, %xmm2
00000000001cd324	xorps	%xmm5, %xmm2
00000000001cd327	xorps	%xmm4, %xmm4
00000000001cd32a	cmpltss	%xmm4, %xmm6
00000000001cd32f	movaps	%xmm6, %xmm0
00000000001cd332	blendvps	%xmm0, %xmm2, %xmm1
00000000001cd337	movss	%xmm1, (%r14)
00000000001cd33c	movss	0x64(%r12), %xmm2
00000000001cd343	movss	0x74(%r12), %xmm0
00000000001cd34a	movss	0x94(%r12), %xmm3
00000000001cd354	movss	0x4(%r14), %xmm6
00000000001cd35a	ucomiss	%xmm6, %xmm4
00000000001cd35d	movaps	%xmm6, %xmm1
00000000001cd360	jbe	0x1cd36e
00000000001cd362	movaps	%xmm6, %xmm1
00000000001cd365	xorps	%xmm5, %xmm1
00000000001cd368	movss	%xmm1, 0x4(%r14)
00000000001cd36e	ucomiss	%xmm1, %xmm3
00000000001cd371	jbe	0x1cd37f
00000000001cd373	mulss	0x84(%r12), %xmm1
00000000001cd37d	jmp	0x1cd3a5
00000000001cd37f	mulss	%xmm1, %xmm2
00000000001cd383	addss	%xmm2, %xmm0
00000000001cd387	movss	0x54(%r12), %xmm1
00000000001cd38e	movaps	%xmm6, -0x40(%rbp)
00000000001cd392	callq	0x3c54f2                        ## symbol stub for: _powf
00000000001cd397	movaps	-0x40(%rbp), %xmm6
00000000001cd39b	movaps	0x1fcd2e(%rip), %xmm5
00000000001cd3a2	movaps	%xmm0, %xmm1
00000000001cd3a5	movaps	%xmm1, %xmm2
00000000001cd3a8	xorps	%xmm5, %xmm2
00000000001cd3ab	xorps	%xmm4, %xmm4
00000000001cd3ae	cmpltss	%xmm4, %xmm6
00000000001cd3b3	movaps	%xmm6, %xmm0
00000000001cd3b6	blendvps	%xmm0, %xmm2, %xmm1
00000000001cd3bb	movss	%xmm1, 0x4(%r14)
00000000001cd3c1	movss	0x68(%r12), %xmm2
00000000001cd3c8	movss	0x78(%r12), %xmm0
00000000001cd3cf	movss	0x98(%r12), %xmm3
00000000001cd3d9	movss	0x8(%r14), %xmm6
00000000001cd3df	ucomiss	%xmm6, %xmm4
00000000001cd3e2	movaps	%xmm6, %xmm1
00000000001cd3e5	jbe	0x1cd3f3
00000000001cd3e7	movaps	%xmm6, %xmm1
00000000001cd3ea	xorps	%xmm5, %xmm1
00000000001cd3ed	movss	%xmm1, 0x8(%r14)
00000000001cd3f3	ucomiss	%xmm1, %xmm3
00000000001cd3f6	ja	0x1ccdb8
00000000001cd3fc	mulss	%xmm1, %xmm2
00000000001cd400	addss	%xmm2, %xmm0
00000000001cd404	movss	0x58(%r12), %xmm1
00000000001cd40b	movaps	%xmm6, -0x40(%rbp)
00000000001cd40f	callq	0x3c54f2                        ## symbol stub for: _powf
00000000001cd414	movaps	-0x40(%rbp), %xmm6
00000000001cd418	movaps	0x1fccb1(%rip), %xmm5
00000000001cd41f	movaps	%xmm0, %xmm1
00000000001cd422	jmp	0x1ccdd0
00000000001cd427	movss	0x50(%r12), %xmm1
00000000001cd42e	callq	0x3c54f2                        ## symbol stub for: _powf
00000000001cd433	movaps	0x1fcc96(%rip), %xmm2
00000000001cd43a	movss	%xmm0, (%r14)
00000000001cd43f	movss	0x4(%r14), %xmm0
00000000001cd445	xorps	%xmm1, %xmm1
00000000001cd448	ucomiss	%xmm0, %xmm1
00000000001cd44b	jbe	0x1cd46e
00000000001cd44d	xorps	%xmm2, %xmm0
00000000001cd450	movss	%xmm0, 0x4(%r14)
00000000001cd456	movss	0x54(%r12), %xmm1
00000000001cd45d	callq	0x3c54f2                        ## symbol stub for: _powf
00000000001cd462	movaps	0x1fcc67(%rip), %xmm2
00000000001cd469	xorps	%xmm2, %xmm0
00000000001cd46c	jmp	0x1cd481
00000000001cd46e	movss	0x54(%r12), %xmm1
00000000001cd475	callq	0x3c54f2                        ## symbol stub for: _powf
00000000001cd47a	movaps	0x1fcc4f(%rip), %xmm2
00000000001cd481	movss	%xmm0, 0x4(%r14)
00000000001cd487	movss	0x8(%r14), %xmm0
00000000001cd48d	xorps	%xmm1, %xmm1
00000000001cd490	ucomiss	%xmm0, %xmm1
00000000001cd493	jbe	0x1cd4bf
00000000001cd495	xorps	%xmm2, %xmm0
00000000001cd498	movss	%xmm0, 0x8(%r14)
00000000001cd49e	movss	0x58(%r12), %xmm1
00000000001cd4a5	callq	0x3c54f2                        ## symbol stub for: _powf
00000000001cd4aa	movaps	0x1fcc1f(%rip), %xmm5
00000000001cd4b1	xorps	%xmm5, %xmm0
00000000001cd4b4	movss	%xmm0, 0x8(%r14)
00000000001cd4ba	jmp	0x1ccdec
00000000001cd4bf	movss	0x58(%r12), %xmm1
00000000001cd4c6	callq	0x3c54f2                        ## symbol stub for: _powf
00000000001cd4cb	movaps	0x1fcbfe(%rip), %xmm5
00000000001cd4d2	movss	%xmm0, 0x8(%r14)
00000000001cd4d8	jmp	0x1ccdec
00000000001cd4dd	mulss	%xmm3, %xmm2
00000000001cd4e1	addss	%xmm2, %xmm0
00000000001cd4e5	movss	0x50(%r12), %xmm1
00000000001cd4ec	movaps	%xmm6, -0x40(%rbp)
00000000001cd4f0	callq	0x3c54f2                        ## symbol stub for: _powf
00000000001cd4f5	movaps	-0x40(%rbp), %xmm6
00000000001cd4f9	movaps	0x1fcbd0(%rip), %xmm5
00000000001cd500	movaps	%xmm0, %xmm1
00000000001cd503	addss	0xa0(%r12), %xmm1
00000000001cd50d	movaps	%xmm1, %xmm2
00000000001cd510	xorps	%xmm5, %xmm2
00000000001cd513	xorps	%xmm3, %xmm3
00000000001cd516	cmpltss	%xmm3, %xmm6
00000000001cd51b	movaps	%xmm6, %xmm0
00000000001cd51e	blendvps	%xmm0, %xmm2, %xmm1
00000000001cd523	movss	%xmm1, (%r14)
00000000001cd528	movss	0x64(%r12), %xmm2
00000000001cd52f	movss	0x74(%r12), %xmm0
00000000001cd536	movss	0x84(%r12), %xmm1
00000000001cd540	movss	0x94(%r12), %xmm4
00000000001cd54a	movss	0x4(%r14), %xmm6
00000000001cd550	ucomiss	%xmm6, %xmm3
00000000001cd553	movaps	%xmm6, %xmm3
00000000001cd556	jbe	0x1cd564
00000000001cd558	movaps	%xmm6, %xmm3
00000000001cd55b	xorps	%xmm5, %xmm3
00000000001cd55e	movss	%xmm3, 0x4(%r14)
00000000001cd564	ucomiss	%xmm3, %xmm4
00000000001cd567	jbe	0x1cd579
00000000001cd569	mulss	%xmm3, %xmm1
00000000001cd56d	addss	0xb4(%r12), %xmm1
00000000001cd577	jmp	0x1cd5a9
00000000001cd579	mulss	%xmm3, %xmm2
00000000001cd57d	addss	%xmm2, %xmm0
00000000001cd581	movss	0x54(%r12), %xmm1
00000000001cd588	movaps	%xmm6, -0x40(%rbp)
00000000001cd58c	callq	0x3c54f2                        ## symbol stub for: _powf
00000000001cd591	movaps	-0x40(%rbp), %xmm6
00000000001cd595	movaps	0x1fcb34(%rip), %xmm5
00000000001cd59c	movaps	%xmm0, %xmm1
00000000001cd59f	addss	0xa4(%r12), %xmm1
00000000001cd5a9	movaps	%xmm1, %xmm2
00000000001cd5ac	xorps	%xmm5, %xmm2
00000000001cd5af	xorps	%xmm3, %xmm3
00000000001cd5b2	cmpltss	%xmm3, %xmm6
00000000001cd5b7	movaps	%xmm6, %xmm0
00000000001cd5ba	blendvps	%xmm0, %xmm2, %xmm1
00000000001cd5bf	movss	%xmm1, 0x4(%r14)
00000000001cd5c5	movss	0x68(%r12), %xmm2
00000000001cd5cc	movss	0x78(%r12), %xmm0
00000000001cd5d3	movss	0x88(%r12), %xmm1
00000000001cd5dd	movss	0x98(%r12), %xmm4
00000000001cd5e7	movss	0x8(%r14), %xmm6
00000000001cd5ed	ucomiss	%xmm6, %xmm3
00000000001cd5f0	movaps	%xmm6, %xmm3
00000000001cd5f3	jbe	0x1cd601
00000000001cd5f5	movaps	%xmm6, %xmm3
00000000001cd5f8	xorps	%xmm5, %xmm3
00000000001cd5fb	movss	%xmm3, 0x8(%r14)
00000000001cd601	ucomiss	%xmm3, %xmm4
00000000001cd604	jbe	0x1cd619
00000000001cd606	mulss	%xmm3, %xmm1
00000000001cd60a	addss	0xb8(%r12), %xmm1
00000000001cd614	jmp	0x1ccdd0
00000000001cd619	mulss	%xmm3, %xmm2
00000000001cd61d	addss	%xmm2, %xmm0
00000000001cd621	movss	0x58(%r12), %xmm1
00000000001cd628	movaps	%xmm6, -0x40(%rbp)
00000000001cd62c	callq	0x3c54f2                        ## symbol stub for: _powf
00000000001cd631	movaps	-0x40(%rbp), %xmm6
00000000001cd635	movaps	0x1fca94(%rip), %xmm5
00000000001cd63c	movaps	%xmm0, %xmm1
00000000001cd63f	addss	0xa8(%r12), %xmm1
00000000001cd649	jmp	0x1ccdd0
00000000001cd64e	movq	%r12, %rdi
00000000001cd651	callq	__ZN16HGSynchronizable6UnlockEv ## HGSynchronizable::Unlock()
00000000001cd656	jmp	0x1cd685
00000000001cd658	movq	__ZN14HGColorConform19s_NodeListCacheLockE(%rip), %r14 ## HGColorConform::s_NodeListCacheLock
00000000001cd65f	movq	%r14, -0x70(%rbp)
00000000001cd663	movb	$0x0, -0x68(%rbp)
00000000001cd667	movq	%r14, %rdi
00000000001cd66a	callq	__ZN16HGSynchronizable4LockEv   ## HGSynchronizable::Lock()
00000000001cd66f	movq	-0x80(%rbp), %rdi
00000000001cd673	movq	(%rdi), %rax
00000000001cd676	callq	*0x18(%rax)
00000000001cd679	movq	%r14, %rdi
00000000001cd67c	callq	__ZN16HGSynchronizable6UnlockEv ## HGSynchronizable::Unlock()
00000000001cd681	movzbl	-0x29(%rbp), %ebx
00000000001cd685	movl	%ebx, %eax
00000000001cd687	addq	$0x58, %rsp
00000000001cd68b	popq	%rbx
00000000001cd68c	popq	%r12
00000000001cd68e	popq	%r13
00000000001cd690	popq	%r14
00000000001cd692	popq	%r15
00000000001cd694	popq	%rbp
00000000001cd695	retq
00000000001cd696	callq	__ZNSt3__16vectorIP26HGColorConformNodeListItemNS_9allocatorIS2_EEE20__throw_out_of_rangeB9nqe210106Ev ## std::__1::vector<HGColorConformNodeListItem*, std::__1::allocator<HGColorConformNodeListItem*>>::__throw_out_of_range[abi:nqe210106]()
00000000001cd69b	callq	__ZNSt3__16vectorIP26HGColorConformNodeListItemNS_9allocatorIS2_EEE20__throw_out_of_rangeB9nqe210106Ev ## std::__1::vector<HGColorConformNodeListItem*, std::__1::allocator<HGColorConformNodeListItem*>>::__throw_out_of_range[abi:nqe210106]()
00000000001cd6a0	ud2
00000000001cd6a2	movq	%rax, %rdi
00000000001cd6a5	callq	___clang_call_terminate
00000000001cd6aa	jmp	0x1cd6cf
00000000001cd6ac	movq	%rax, %rdi
00000000001cd6af	callq	___clang_call_terminate
00000000001cd6b4	movq	%rax, %rdi
00000000001cd6b7	callq	___clang_call_terminate
00000000001cd6bc	movq	%rax, %rbx
00000000001cd6bf	movq	%r12, %rdi
00000000001cd6c2	callq	0x3c4fa0                        ## symbol stub for: __ZdlPv
00000000001cd6c7	movq	%rbx, %rdi
00000000001cd6ca	callq	0x3c4e02                        ## symbol stub for: __Unwind_Resume
00000000001cd6cf	movq	%rax, %rbx
00000000001cd6d2	leaq	-0x70(%rbp), %rdi
00000000001cd6d6	callq	__ZN14HGSynchronizerD1Ev        ## HGSynchronizer::~HGSynchronizer()
00000000001cd6db	movq	%rbx, %rdi
00000000001cd6de	callq	0x3c4e02                        ## symbol stub for: __Unwind_Resume
00000000001cd6e3	nop
00000000001cd6e4	idivq	%r15
00000000001cd6e7	incl	-0x7660001(%rbx,%rdi,8)
00000000001cd6ee	.byte 0xff #bad opcode
00000000001cd6ef	.byte 0xff #bad opcode
00000000001cd6f0	fdivr	%st(1), %st
00000000001cd6f2	.byte 0xff #bad opcode
00000000001cd6f3	decl	-0x8(%rbx)
00000000001cd6f6	.byte 0xff #bad opcode
00000000001cd6f7	.byte 0xff #bad opcode
00000000001cd6f8	movl	$0xffffffb, %ebx                ## imm = 0xFFFFFFB
00000000001cd6fd	.byte 0x1f #bad opcode
00000000001cd6fe	addb	%dl, 0x48(%rbp)
00000000001cd702	movl	%esp, %ebp
00000000001cd704	movq	0x10(%rdi), %rax
00000000001cd708	popq	%rbp
00000000001cd709	retq
00000000001cd70a	nopw	(%rax,%rax)
