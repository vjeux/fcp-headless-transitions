__ZN4glslL3endER8string_tRK8HGLimitsRKN8HGString4HashEbb:
00000000000b51c0	pushq	%rbp
00000000000b51c1	movq	%rsp, %rbp
00000000000b51c4	pushq	%r15
00000000000b51c6	pushq	%r14
00000000000b51c8	pushq	%r13
00000000000b51ca	pushq	%r12
00000000000b51cc	pushq	%rbx
00000000000b51cd	subq	$0x18, %rsp
00000000000b51d1	movl	%ecx, -0x34(%rbp)
00000000000b51d4	movq	%rdx, %r12
00000000000b51d7	movq	%rsi, %r13
00000000000b51da	movq	%rdi, %rbx
00000000000b51dd	movq	0x8(%rdi), %r14
00000000000b51e1	movq	0x10(%rdi), %rax
00000000000b51e5	leaq	0x6(%r14), %rsi
00000000000b51e9	testq	%rax, %rax
00000000000b51ec	movq	%r13, -0x30(%rbp)
00000000000b51f0	je	0xb5225
00000000000b51f2	cmpq	(%rax), %rsi
00000000000b51f5	jb	0xb522d
00000000000b51f7	leaq	0x105(%r14), %r13
00000000000b51fe	andq	$-0x100, %r13
00000000000b5205	movq	0x10(%rax), %rdi
00000000000b5209	movq	%r13, %rsi
00000000000b520c	callq	0x3c55ca                        ## symbol stub for: _realloc
00000000000b5211	movq	0x10(%rbx), %rcx
00000000000b5215	movq	%rax, 0x10(%rcx)
00000000000b5219	movq	%r13, (%rcx)
00000000000b521c	movq	-0x30(%rbp), %r13
00000000000b5220	movq	%rax, (%rbx)
00000000000b5223	jmp	0xb522d
00000000000b5225	movq	%rbx, %rdi
00000000000b5228	callq	__ZL9str_allocR8string_tm       ## str_alloc(string_t&, unsigned long)
00000000000b522d	addq	$0x6, 0x8(%rbx)
00000000000b5232	movq	(%rbx), %rax
00000000000b5235	movw	$0x3d35, 0x4(%rax,%r14)         ## imm = 0x3D35
00000000000b523d	movl	$0x444d2f2f, (%rax,%r14)        ## imm = 0x444D2F2F
00000000000b5245	movl	(%r12), %r15d
00000000000b5249	movq	0x8(%rbx), %r14
00000000000b524d	movq	0x10(%rbx), %rax
00000000000b5251	leaq	0x8(%r14), %rsi
00000000000b5255	testq	%rax, %rax
00000000000b5258	je	0xb528d
00000000000b525a	cmpq	(%rax), %rsi
00000000000b525d	jb	0xb5295
00000000000b525f	leaq	0x107(%r14), %r13
00000000000b5266	andq	$-0x100, %r13
00000000000b526d	movq	0x10(%rax), %rdi
00000000000b5271	movq	%r13, %rsi
00000000000b5274	callq	0x3c55ca                        ## symbol stub for: _realloc
00000000000b5279	movq	0x10(%rbx), %rcx
00000000000b527d	movq	%rax, 0x10(%rcx)
00000000000b5281	movq	%r13, (%rcx)
00000000000b5284	movq	-0x30(%rbp), %r13
00000000000b5288	movq	%rax, (%rbx)
00000000000b528b	jmp	0xb5295
00000000000b528d	movq	%rbx, %rdi
00000000000b5290	callq	__ZL9str_allocR8string_tm       ## str_alloc(string_t&, unsigned long)
00000000000b5295	movl	%r15d, %eax
00000000000b5298	shrl	$0x1c, %eax
00000000000b529b	leal	0x57(%rax), %ecx
00000000000b529e	orb	$0x30, %al
00000000000b52a0	cmpl	$0xa0000000, %r15d              ## imm = 0xA0000000
00000000000b52a7	movzbl	%al, %eax
00000000000b52aa	movzbl	%cl, %ecx
00000000000b52ad	cmovbl	%eax, %ecx
00000000000b52b0	movd	%r15d, %xmm0
00000000000b52b5	pshufd	$0x0, %xmm0, %xmm1              ## xmm1 = xmm0[0,0,0,0]
00000000000b52ba	movdqa	%xmm1, %xmm0
00000000000b52be	psrld	$0xc, %xmm0
00000000000b52c3	movdqa	%xmm1, %xmm2
00000000000b52c7	psrld	$0x14, %xmm2
00000000000b52cc	pshufb	0x3186eb(%rip), %xmm1
00000000000b52d5	pblendw	$0xf0, %xmm0, %xmm2             ## xmm2 = xmm2[0,1,2,3],xmm0[4,5,6,7]
00000000000b52db	pblendw	$0xcc, %xmm2, %xmm1             ## xmm1 = xmm1[0,1],xmm2[2,3],xmm1[4,5],xmm2[6,7]
00000000000b52e1	pand	0x3186e7(%rip), %xmm1
00000000000b52e9	movq	(%rbx), %rax
00000000000b52ec	movdqa	%xmm1, %xmm0
00000000000b52f0	pcmpgtd	0x3186e8(%rip), %xmm0
00000000000b52f8	movdqa	0x3186f0(%rip), %xmm2
00000000000b5300	por	%xmm1, %xmm2
00000000000b5304	paddd	0x3186f4(%rip), %xmm1
00000000000b530c	movb	%cl, (%rax,%r14)
00000000000b5310	blendvps	%xmm0, %xmm1, %xmm2
00000000000b5315	packusdw	%xmm2, %xmm2
00000000000b531a	packuswb	%xmm2, %xmm2
00000000000b531e	movl	%r15d, %ecx
00000000000b5321	shrl	$0x8, %ecx
00000000000b5324	andl	$0xf, %ecx
00000000000b5327	leal	0x57(%rcx), %edx
00000000000b532a	leal	0x30(%rcx), %esi
00000000000b532d	cmpl	$0xa, %ecx
00000000000b5330	movzbl	%sil, %ecx
00000000000b5334	movzbl	%dl, %edx
00000000000b5337	cmovbl	%ecx, %edx
00000000000b533a	movd	%xmm2, 0x1(%rax,%r14)
00000000000b5341	movb	%dl, 0x5(%rax,%r14)
00000000000b5346	movl	%r15d, %ecx
00000000000b5349	shrl	$0x4, %ecx
00000000000b534c	andl	$0xf, %ecx
00000000000b534f	leal	0x57(%rcx), %edx
00000000000b5352	leal	0x30(%rcx), %esi
00000000000b5355	cmpl	$0xa, %ecx
00000000000b5358	movzbl	%sil, %ecx
00000000000b535c	movzbl	%dl, %edx
00000000000b535f	cmovbl	%ecx, %edx
00000000000b5362	andl	$0xf, %r15d
00000000000b5366	leal	0x57(%r15), %ecx
00000000000b536a	leal	0x30(%r15), %esi
00000000000b536e	cmpl	$0xa, %r15d
00000000000b5372	movzbl	%sil, %esi
00000000000b5376	movzbl	%cl, %ecx
00000000000b5379	cmovbl	%esi, %ecx
00000000000b537c	movb	%dl, 0x6(%rax,%r14)
00000000000b5381	movb	%cl, 0x7(%rax,%r14)
00000000000b5386	movq	0x8(%rbx), %rsi
00000000000b538a	movq	0x10(%rbx), %rax
00000000000b538e	leaq	0x8(%rsi), %r14
00000000000b5392	movq	%r14, 0x8(%rbx)
00000000000b5396	addq	$0x9, %rsi
00000000000b539a	testq	%rax, %rax
00000000000b539d	je	0xb53d5
00000000000b539f	cmpq	(%rax), %rsi
00000000000b53a2	jb	0xb53dd
00000000000b53a4	movq	%r14, %r13
00000000000b53a7	andq	$-0x100, %r13
00000000000b53ae	addq	$0x100, %r13                    ## imm = 0x100
00000000000b53b5	movq	0x10(%rax), %rdi
00000000000b53b9	movq	%r13, %rsi
00000000000b53bc	callq	0x3c55ca                        ## symbol stub for: _realloc
00000000000b53c1	movq	0x10(%rbx), %rcx
00000000000b53c5	movq	%rax, 0x10(%rcx)
00000000000b53c9	movq	%r13, (%rcx)
00000000000b53cc	movq	-0x30(%rbp), %r13
00000000000b53d0	movq	%rax, (%rbx)
00000000000b53d3	jmp	0xb53dd
00000000000b53d5	movq	%rbx, %rdi
00000000000b53d8	callq	__ZL9str_allocR8string_tm       ## str_alloc(string_t&, unsigned long)
00000000000b53dd	incq	0x8(%rbx)
00000000000b53e1	movq	(%rbx), %rax
00000000000b53e4	movb	$0x3a, (%rax,%r14)
00000000000b53e9	movl	0x4(%r12), %r15d
00000000000b53ee	movq	0x8(%rbx), %r14
00000000000b53f2	movq	0x10(%rbx), %rax
00000000000b53f6	leaq	0x8(%r14), %rsi
00000000000b53fa	testq	%rax, %rax
00000000000b53fd	je	0xb5432
00000000000b53ff	cmpq	(%rax), %rsi
00000000000b5402	jb	0xb543a
00000000000b5404	leaq	0x107(%r14), %r13
00000000000b540b	andq	$-0x100, %r13
00000000000b5412	movq	0x10(%rax), %rdi
00000000000b5416	movq	%r13, %rsi
00000000000b5419	callq	0x3c55ca                        ## symbol stub for: _realloc
00000000000b541e	movq	0x10(%rbx), %rcx
00000000000b5422	movq	%rax, 0x10(%rcx)
00000000000b5426	movq	%r13, (%rcx)
00000000000b5429	movq	-0x30(%rbp), %r13
00000000000b542d	movq	%rax, (%rbx)
00000000000b5430	jmp	0xb543a
00000000000b5432	movq	%rbx, %rdi
00000000000b5435	callq	__ZL9str_allocR8string_tm       ## str_alloc(string_t&, unsigned long)
00000000000b543a	movl	%r15d, %eax
00000000000b543d	shrl	$0x1c, %eax
00000000000b5440	leal	0x57(%rax), %ecx
00000000000b5443	orb	$0x30, %al
00000000000b5445	cmpl	$0xa0000000, %r15d              ## imm = 0xA0000000
00000000000b544c	movzbl	%al, %eax
00000000000b544f	movzbl	%cl, %ecx
00000000000b5452	cmovbl	%eax, %ecx
00000000000b5455	movd	%r15d, %xmm0
00000000000b545a	pshufd	$0x0, %xmm0, %xmm1              ## xmm1 = xmm0[0,0,0,0]
00000000000b545f	movdqa	%xmm1, %xmm0
00000000000b5463	psrld	$0xc, %xmm0
00000000000b5468	movdqa	%xmm1, %xmm2
00000000000b546c	psrld	$0x14, %xmm2
00000000000b5471	pshufb	0x318546(%rip), %xmm1
00000000000b547a	pblendw	$0xf0, %xmm0, %xmm2             ## xmm2 = xmm2[0,1,2,3],xmm0[4,5,6,7]
00000000000b5480	pblendw	$0xcc, %xmm2, %xmm1             ## xmm1 = xmm1[0,1],xmm2[2,3],xmm1[4,5],xmm2[6,7]
00000000000b5486	pand	0x318542(%rip), %xmm1
00000000000b548e	movq	(%rbx), %rax
00000000000b5491	movdqa	%xmm1, %xmm0
00000000000b5495	pcmpgtd	0x318543(%rip), %xmm0
00000000000b549d	movdqa	0x31854b(%rip), %xmm2
00000000000b54a5	por	%xmm1, %xmm2
00000000000b54a9	paddd	0x31854f(%rip), %xmm1
00000000000b54b1	movb	%cl, (%rax,%r14)
00000000000b54b5	blendvps	%xmm0, %xmm1, %xmm2
00000000000b54ba	packusdw	%xmm2, %xmm2
00000000000b54bf	packuswb	%xmm2, %xmm2
00000000000b54c3	movl	%r15d, %ecx
00000000000b54c6	shrl	$0x8, %ecx
00000000000b54c9	andl	$0xf, %ecx
00000000000b54cc	leal	0x57(%rcx), %edx
00000000000b54cf	leal	0x30(%rcx), %esi
00000000000b54d2	cmpl	$0xa, %ecx
00000000000b54d5	movzbl	%sil, %ecx
00000000000b54d9	movzbl	%dl, %edx
00000000000b54dc	cmovbl	%ecx, %edx
00000000000b54df	movd	%xmm2, 0x1(%rax,%r14)
00000000000b54e6	movb	%dl, 0x5(%rax,%r14)
00000000000b54eb	movl	%r15d, %ecx
00000000000b54ee	shrl	$0x4, %ecx
00000000000b54f1	andl	$0xf, %ecx
00000000000b54f4	leal	0x57(%rcx), %edx
00000000000b54f7	leal	0x30(%rcx), %esi
00000000000b54fa	cmpl	$0xa, %ecx
00000000000b54fd	movzbl	%sil, %ecx
00000000000b5501	movzbl	%dl, %edx
00000000000b5504	cmovbl	%ecx, %edx
00000000000b5507	andl	$0xf, %r15d
00000000000b550b	leal	0x57(%r15), %ecx
00000000000b550f	leal	0x30(%r15), %esi
00000000000b5513	cmpl	$0xa, %r15d
00000000000b5517	movzbl	%sil, %esi
00000000000b551b	movzbl	%cl, %ecx
00000000000b551e	cmovbl	%esi, %ecx
00000000000b5521	movb	%dl, 0x6(%rax,%r14)
00000000000b5526	movb	%cl, 0x7(%rax,%r14)
00000000000b552b	movq	0x8(%rbx), %rsi
00000000000b552f	movq	0x10(%rbx), %rax
00000000000b5533	leaq	0x8(%rsi), %r14
00000000000b5537	movq	%r14, 0x8(%rbx)
00000000000b553b	addq	$0x9, %rsi
00000000000b553f	testq	%rax, %rax
00000000000b5542	je	0xb557a
00000000000b5544	cmpq	(%rax), %rsi
00000000000b5547	jb	0xb5582
00000000000b5549	movq	%r14, %r13
00000000000b554c	andq	$-0x100, %r13
00000000000b5553	addq	$0x100, %r13                    ## imm = 0x100
00000000000b555a	movq	0x10(%rax), %rdi
00000000000b555e	movq	%r13, %rsi
00000000000b5561	callq	0x3c55ca                        ## symbol stub for: _realloc
00000000000b5566	movq	0x10(%rbx), %rcx
00000000000b556a	movq	%rax, 0x10(%rcx)
00000000000b556e	movq	%r13, (%rcx)
00000000000b5571	movq	-0x30(%rbp), %r13
00000000000b5575	movq	%rax, (%rbx)
00000000000b5578	jmp	0xb5582
00000000000b557a	movq	%rbx, %rdi
00000000000b557d	callq	__ZL9str_allocR8string_tm       ## str_alloc(string_t&, unsigned long)
00000000000b5582	incq	0x8(%rbx)
00000000000b5586	movq	(%rbx), %rax
00000000000b5589	movb	$0x3a, (%rax,%r14)
00000000000b558e	movl	0x8(%r12), %r15d
00000000000b5593	movq	0x8(%rbx), %r14
00000000000b5597	movq	0x10(%rbx), %rax
00000000000b559b	leaq	0x8(%r14), %rsi
00000000000b559f	testq	%rax, %rax
00000000000b55a2	je	0xb55d7
00000000000b55a4	cmpq	(%rax), %rsi
00000000000b55a7	jb	0xb55df
00000000000b55a9	leaq	0x107(%r14), %r13
00000000000b55b0	andq	$-0x100, %r13
00000000000b55b7	movq	0x10(%rax), %rdi
00000000000b55bb	movq	%r13, %rsi
00000000000b55be	callq	0x3c55ca                        ## symbol stub for: _realloc
00000000000b55c3	movq	0x10(%rbx), %rcx
00000000000b55c7	movq	%rax, 0x10(%rcx)
00000000000b55cb	movq	%r13, (%rcx)
00000000000b55ce	movq	-0x30(%rbp), %r13
00000000000b55d2	movq	%rax, (%rbx)
00000000000b55d5	jmp	0xb55df
00000000000b55d7	movq	%rbx, %rdi
00000000000b55da	callq	__ZL9str_allocR8string_tm       ## str_alloc(string_t&, unsigned long)
00000000000b55df	movl	%r15d, %eax
00000000000b55e2	shrl	$0x1c, %eax
00000000000b55e5	leal	0x57(%rax), %ecx
00000000000b55e8	orb	$0x30, %al
00000000000b55ea	cmpl	$0xa0000000, %r15d              ## imm = 0xA0000000
00000000000b55f1	movzbl	%al, %eax
00000000000b55f4	movzbl	%cl, %ecx
00000000000b55f7	cmovbl	%eax, %ecx
00000000000b55fa	movd	%r15d, %xmm0
00000000000b55ff	pshufd	$0x0, %xmm0, %xmm1              ## xmm1 = xmm0[0,0,0,0]
00000000000b5604	movdqa	%xmm1, %xmm0
00000000000b5608	psrld	$0xc, %xmm0
00000000000b560d	movdqa	%xmm1, %xmm2
00000000000b5611	psrld	$0x14, %xmm2
00000000000b5616	pshufb	0x3183a1(%rip), %xmm1
00000000000b561f	pblendw	$0xf0, %xmm0, %xmm2             ## xmm2 = xmm2[0,1,2,3],xmm0[4,5,6,7]
00000000000b5625	pblendw	$0xcc, %xmm2, %xmm1             ## xmm1 = xmm1[0,1],xmm2[2,3],xmm1[4,5],xmm2[6,7]
00000000000b562b	pand	0x31839d(%rip), %xmm1
00000000000b5633	movq	(%rbx), %rax
00000000000b5636	movdqa	%xmm1, %xmm0
00000000000b563a	pcmpgtd	0x31839e(%rip), %xmm0
00000000000b5642	movdqa	0x3183a6(%rip), %xmm2
00000000000b564a	por	%xmm1, %xmm2
00000000000b564e	paddd	0x3183aa(%rip), %xmm1
00000000000b5656	movb	%cl, (%rax,%r14)
00000000000b565a	blendvps	%xmm0, %xmm1, %xmm2
00000000000b565f	packusdw	%xmm2, %xmm2
00000000000b5664	packuswb	%xmm2, %xmm2
00000000000b5668	movl	%r15d, %ecx
00000000000b566b	shrl	$0x8, %ecx
00000000000b566e	andl	$0xf, %ecx
00000000000b5671	leal	0x57(%rcx), %edx
00000000000b5674	leal	0x30(%rcx), %esi
00000000000b5677	cmpl	$0xa, %ecx
00000000000b567a	movzbl	%sil, %ecx
00000000000b567e	movzbl	%dl, %edx
00000000000b5681	cmovbl	%ecx, %edx
00000000000b5684	movd	%xmm2, 0x1(%rax,%r14)
00000000000b568b	movb	%dl, 0x5(%rax,%r14)
00000000000b5690	movl	%r15d, %ecx
00000000000b5693	shrl	$0x4, %ecx
00000000000b5696	andl	$0xf, %ecx
00000000000b5699	leal	0x57(%rcx), %edx
00000000000b569c	leal	0x30(%rcx), %esi
00000000000b569f	cmpl	$0xa, %ecx
00000000000b56a2	movzbl	%sil, %ecx
00000000000b56a6	movzbl	%dl, %edx
00000000000b56a9	cmovbl	%ecx, %edx
00000000000b56ac	andl	$0xf, %r15d
00000000000b56b0	leal	0x57(%r15), %ecx
00000000000b56b4	leal	0x30(%r15), %esi
00000000000b56b8	cmpl	$0xa, %r15d
00000000000b56bc	movzbl	%sil, %esi
00000000000b56c0	movzbl	%cl, %ecx
00000000000b56c3	cmovbl	%esi, %ecx
00000000000b56c6	movb	%dl, 0x6(%rax,%r14)
00000000000b56cb	movb	%cl, 0x7(%rax,%r14)
00000000000b56d0	movq	0x8(%rbx), %rsi
00000000000b56d4	movq	0x10(%rbx), %rax
00000000000b56d8	leaq	0x8(%rsi), %r14
00000000000b56dc	movq	%r14, 0x8(%rbx)
00000000000b56e0	addq	$0x9, %rsi
00000000000b56e4	testq	%rax, %rax
00000000000b56e7	je	0xb571f
00000000000b56e9	cmpq	(%rax), %rsi
00000000000b56ec	jb	0xb5727
00000000000b56ee	movq	%r14, %r13
00000000000b56f1	andq	$-0x100, %r13
00000000000b56f8	addq	$0x100, %r13                    ## imm = 0x100
00000000000b56ff	movq	0x10(%rax), %rdi
00000000000b5703	movq	%r13, %rsi
00000000000b5706	callq	0x3c55ca                        ## symbol stub for: _realloc
00000000000b570b	movq	0x10(%rbx), %rcx
00000000000b570f	movq	%rax, 0x10(%rcx)
00000000000b5713	movq	%r13, (%rcx)
00000000000b5716	movq	-0x30(%rbp), %r13
00000000000b571a	movq	%rax, (%rbx)
00000000000b571d	jmp	0xb5727
00000000000b571f	movq	%rbx, %rdi
00000000000b5722	callq	__ZL9str_allocR8string_tm       ## str_alloc(string_t&, unsigned long)
00000000000b5727	incq	0x8(%rbx)
00000000000b572b	movq	(%rbx), %rax
00000000000b572e	movb	$0x3a, (%rax,%r14)
00000000000b5733	movl	0xc(%r12), %r15d
00000000000b5738	movq	0x8(%rbx), %r14
00000000000b573c	movq	0x10(%rbx), %rax
00000000000b5740	leaq	0x8(%r14), %rsi
00000000000b5744	testq	%rax, %rax
00000000000b5747	je	0xb5778
00000000000b5749	cmpq	(%rax), %rsi
00000000000b574c	jb	0xb5780
00000000000b574e	leaq	0x107(%r14), %r12
00000000000b5755	andq	$-0x100, %r12
00000000000b575c	movq	0x10(%rax), %rdi
00000000000b5760	movq	%r12, %rsi
00000000000b5763	callq	0x3c55ca                        ## symbol stub for: _realloc
00000000000b5768	movq	0x10(%rbx), %rcx
00000000000b576c	movq	%rax, 0x10(%rcx)
00000000000b5770	movq	%r12, (%rcx)
00000000000b5773	movq	%rax, (%rbx)
00000000000b5776	jmp	0xb5780
00000000000b5778	movq	%rbx, %rdi
00000000000b577b	callq	__ZL9str_allocR8string_tm       ## str_alloc(string_t&, unsigned long)
00000000000b5780	movl	%r15d, %eax
00000000000b5783	shrl	$0x1c, %eax
00000000000b5786	leal	0x57(%rax), %ecx
00000000000b5789	orb	$0x30, %al
00000000000b578b	cmpl	$0xa0000000, %r15d              ## imm = 0xA0000000
00000000000b5792	movzbl	%al, %eax
00000000000b5795	movzbl	%cl, %ecx
00000000000b5798	cmovbl	%eax, %ecx
00000000000b579b	movd	%r15d, %xmm0
00000000000b57a0	pshufd	$0x0, %xmm0, %xmm1              ## xmm1 = xmm0[0,0,0,0]
00000000000b57a5	movdqa	%xmm1, %xmm0
00000000000b57a9	psrld	$0xc, %xmm0
00000000000b57ae	movdqa	%xmm1, %xmm2
00000000000b57b2	psrld	$0x14, %xmm2
00000000000b57b7	pshufb	0x318200(%rip), %xmm1
00000000000b57c0	pblendw	$0xf0, %xmm0, %xmm2             ## xmm2 = xmm2[0,1,2,3],xmm0[4,5,6,7]
00000000000b57c6	pblendw	$0xcc, %xmm2, %xmm1             ## xmm1 = xmm1[0,1],xmm2[2,3],xmm1[4,5],xmm2[6,7]
00000000000b57cc	pand	0x3181fc(%rip), %xmm1
00000000000b57d4	movq	(%rbx), %rax
00000000000b57d7	movdqa	%xmm1, %xmm0
00000000000b57db	pcmpgtd	0x3181fd(%rip), %xmm0
00000000000b57e3	movdqa	0x318205(%rip), %xmm2
00000000000b57eb	por	%xmm1, %xmm2
00000000000b57ef	paddd	0x318209(%rip), %xmm1
00000000000b57f7	movb	%cl, (%rax,%r14)
00000000000b57fb	blendvps	%xmm0, %xmm1, %xmm2
00000000000b5800	packusdw	%xmm2, %xmm2
00000000000b5805	packuswb	%xmm2, %xmm2
00000000000b5809	movl	%r15d, %ecx
00000000000b580c	shrl	$0x8, %ecx
00000000000b580f	andl	$0xf, %ecx
00000000000b5812	leal	0x57(%rcx), %edx
00000000000b5815	leal	0x30(%rcx), %esi
00000000000b5818	cmpl	$0xa, %ecx
00000000000b581b	movzbl	%sil, %ecx
00000000000b581f	movzbl	%dl, %edx
00000000000b5822	cmovbl	%ecx, %edx
00000000000b5825	movd	%xmm2, 0x1(%rax,%r14)
00000000000b582c	movb	%dl, 0x5(%rax,%r14)
00000000000b5831	movl	%r15d, %ecx
00000000000b5834	shrl	$0x4, %ecx
00000000000b5837	andl	$0xf, %ecx
00000000000b583a	leal	0x57(%rcx), %edx
00000000000b583d	leal	0x30(%rcx), %esi
00000000000b5840	cmpl	$0xa, %ecx
00000000000b5843	movzbl	%sil, %ecx
00000000000b5847	movzbl	%dl, %edx
00000000000b584a	cmovbl	%ecx, %edx
00000000000b584d	andl	$0xf, %r15d
00000000000b5851	leal	0x57(%r15), %ecx
00000000000b5855	leal	0x30(%r15), %esi
00000000000b5859	cmpl	$0xa, %r15d
00000000000b585d	movzbl	%sil, %esi
00000000000b5861	movzbl	%cl, %ecx
00000000000b5864	cmovbl	%esi, %ecx
00000000000b5867	movb	%dl, 0x6(%rax,%r14)
00000000000b586c	movb	%cl, 0x7(%rax,%r14)
00000000000b5871	movq	0x8(%rbx), %rsi
00000000000b5875	movq	0x10(%rbx), %rax
00000000000b5879	leaq	0x8(%rsi), %r14
00000000000b587d	movq	%r14, 0x8(%rbx)
00000000000b5881	addq	$0x9, %rsi
00000000000b5885	testq	%rax, %rax
00000000000b5888	je	0xb58bc
00000000000b588a	cmpq	(%rax), %rsi
00000000000b588d	jb	0xb58c4
00000000000b588f	movq	%r14, %r12
00000000000b5892	andq	$-0x100, %r12
00000000000b5899	addq	$0x100, %r12                    ## imm = 0x100
00000000000b58a0	movq	0x10(%rax), %rdi
00000000000b58a4	movq	%r12, %rsi
00000000000b58a7	callq	0x3c55ca                        ## symbol stub for: _realloc
00000000000b58ac	movq	0x10(%rbx), %rcx
00000000000b58b0	movq	%rax, 0x10(%rcx)
00000000000b58b4	movq	%r12, (%rcx)
00000000000b58b7	movq	%rax, (%rbx)
00000000000b58ba	jmp	0xb58c4
00000000000b58bc	movq	%rbx, %rdi
00000000000b58bf	callq	__ZL9str_allocR8string_tm       ## str_alloc(string_t&, unsigned long)
00000000000b58c4	incq	0x8(%rbx)
00000000000b58c8	movq	(%rbx), %rax
00000000000b58cb	movb	$0xa, (%rax,%r14)
00000000000b58d0	movq	0x8(%rbx), %r14
00000000000b58d4	movq	0x10(%rbx), %rax
00000000000b58d8	leaq	0x6(%r14), %rsi
00000000000b58dc	testq	%rax, %rax
00000000000b58df	je	0xb5910
00000000000b58e1	cmpq	(%rax), %rsi
00000000000b58e4	jb	0xb5918
00000000000b58e6	leaq	0x105(%r14), %r12
00000000000b58ed	andq	$-0x100, %r12
00000000000b58f4	movq	0x10(%rax), %rdi
00000000000b58f8	movq	%r12, %rsi
00000000000b58fb	callq	0x3c55ca                        ## symbol stub for: _realloc
00000000000b5900	movq	0x10(%rbx), %rcx
00000000000b5904	movq	%rax, 0x10(%rcx)
00000000000b5908	movq	%r12, (%rcx)
00000000000b590b	movq	%rax, (%rbx)
00000000000b590e	jmp	0xb5918
00000000000b5910	movq	%rbx, %rdi
00000000000b5913	callq	__ZL9str_allocR8string_tm       ## str_alloc(string_t&, unsigned long)
00000000000b5918	addq	$0x6, 0x8(%rbx)
00000000000b591d	movq	(%rbx), %rax
00000000000b5920	movw	$0x3d47, 0x4(%rax,%r14)         ## imm = 0x3D47
00000000000b5928	movl	$0x49532f2f, (%rax,%r14)        ## imm = 0x49532F2F
00000000000b5930	movl	0x4(%r13), %r15d
00000000000b5934	movq	0x8(%rbx), %r14
00000000000b5938	movq	0x10(%rbx), %rax
00000000000b593c	leaq	0x8(%r14), %rsi
00000000000b5940	testq	%rax, %rax
00000000000b5943	je	0xb5974
00000000000b5945	cmpq	(%rax), %rsi
00000000000b5948	jb	0xb597c
00000000000b594a	leaq	0x107(%r14), %r12
00000000000b5951	andq	$-0x100, %r12
00000000000b5958	movq	0x10(%rax), %rdi
00000000000b595c	movq	%r12, %rsi
00000000000b595f	callq	0x3c55ca                        ## symbol stub for: _realloc
00000000000b5964	movq	0x10(%rbx), %rcx
00000000000b5968	movq	%rax, 0x10(%rcx)
00000000000b596c	movq	%r12, (%rcx)
00000000000b596f	movq	%rax, (%rbx)
00000000000b5972	jmp	0xb597c
00000000000b5974	movq	%rbx, %rdi
00000000000b5977	callq	__ZL9str_allocR8string_tm       ## str_alloc(string_t&, unsigned long)
00000000000b597c	movl	%r15d, %eax
00000000000b597f	shrl	$0x1c, %eax
00000000000b5982	leal	0x57(%rax), %ecx
00000000000b5985	orb	$0x30, %al
00000000000b5987	cmpl	$0xa0000000, %r15d              ## imm = 0xA0000000
00000000000b598e	movzbl	%al, %eax
00000000000b5991	movzbl	%cl, %ecx
00000000000b5994	cmovbl	%eax, %ecx
00000000000b5997	movd	%r15d, %xmm0
00000000000b599c	pshufd	$0x0, %xmm0, %xmm1              ## xmm1 = xmm0[0,0,0,0]
00000000000b59a1	movdqa	%xmm1, %xmm0
00000000000b59a5	psrld	$0xc, %xmm0
00000000000b59aa	movdqa	%xmm1, %xmm2
00000000000b59ae	psrld	$0x14, %xmm2
00000000000b59b3	pshufb	0x318004(%rip), %xmm1
00000000000b59bc	pblendw	$0xf0, %xmm0, %xmm2             ## xmm2 = xmm2[0,1,2,3],xmm0[4,5,6,7]
00000000000b59c2	pblendw	$0xcc, %xmm2, %xmm1             ## xmm1 = xmm1[0,1],xmm2[2,3],xmm1[4,5],xmm2[6,7]
00000000000b59c8	pand	0x318000(%rip), %xmm1
00000000000b59d0	movq	(%rbx), %rax
00000000000b59d3	movdqa	%xmm1, %xmm0
00000000000b59d7	pcmpgtd	0x318001(%rip), %xmm0
00000000000b59df	movdqa	0x318009(%rip), %xmm2
00000000000b59e7	por	%xmm1, %xmm2
00000000000b59eb	paddd	0x31800d(%rip), %xmm1
00000000000b59f3	movb	%cl, (%rax,%r14)
00000000000b59f7	blendvps	%xmm0, %xmm1, %xmm2
00000000000b59fc	packusdw	%xmm2, %xmm2
00000000000b5a01	packuswb	%xmm2, %xmm2
00000000000b5a05	movl	%r15d, %ecx
00000000000b5a08	shrl	$0x8, %ecx
00000000000b5a0b	andl	$0xf, %ecx
00000000000b5a0e	leal	0x57(%rcx), %edx
00000000000b5a11	leal	0x30(%rcx), %esi
00000000000b5a14	cmpl	$0xa, %ecx
00000000000b5a17	movzbl	%sil, %ecx
00000000000b5a1b	movzbl	%dl, %edx
00000000000b5a1e	cmovbl	%ecx, %edx
00000000000b5a21	movd	%xmm2, 0x1(%rax,%r14)
00000000000b5a28	movb	%dl, 0x5(%rax,%r14)
00000000000b5a2d	movl	%r15d, %ecx
00000000000b5a30	shrl	$0x4, %ecx
00000000000b5a33	andl	$0xf, %ecx
00000000000b5a36	leal	0x57(%rcx), %edx
00000000000b5a39	leal	0x30(%rcx), %esi
00000000000b5a3c	cmpl	$0xa, %ecx
00000000000b5a3f	movzbl	%sil, %ecx
00000000000b5a43	movzbl	%dl, %edx
00000000000b5a46	cmovbl	%ecx, %edx
00000000000b5a49	andl	$0xf, %r15d
00000000000b5a4d	leal	0x57(%r15), %ecx
00000000000b5a51	leal	0x30(%r15), %esi
00000000000b5a55	cmpl	$0xa, %r15d
00000000000b5a59	movzbl	%sil, %esi
00000000000b5a5d	movzbl	%cl, %ecx
00000000000b5a60	cmovbl	%esi, %ecx
00000000000b5a63	movb	%dl, 0x6(%rax,%r14)
00000000000b5a68	movb	%cl, 0x7(%rax,%r14)
00000000000b5a6d	movq	0x8(%rbx), %rsi
00000000000b5a71	movq	0x10(%rbx), %rax
00000000000b5a75	leaq	0x8(%rsi), %r14
00000000000b5a79	movq	%r14, 0x8(%rbx)
00000000000b5a7d	addq	$0x9, %rsi
00000000000b5a81	testq	%rax, %rax
00000000000b5a84	je	0xb5ab8
00000000000b5a86	cmpq	(%rax), %rsi
00000000000b5a89	jb	0xb5ac0
00000000000b5a8b	movq	%r14, %r12
00000000000b5a8e	andq	$-0x100, %r12
00000000000b5a95	addq	$0x100, %r12                    ## imm = 0x100
00000000000b5a9c	movq	0x10(%rax), %rdi
00000000000b5aa0	movq	%r12, %rsi
00000000000b5aa3	callq	0x3c55ca                        ## symbol stub for: _realloc
00000000000b5aa8	movq	0x10(%rbx), %rcx
00000000000b5aac	movq	%rax, 0x10(%rcx)
00000000000b5ab0	movq	%r12, (%rcx)
00000000000b5ab3	movq	%rax, (%rbx)
00000000000b5ab6	jmp	0xb5ac0
00000000000b5ab8	movq	%rbx, %rdi
00000000000b5abb	callq	__ZL9str_allocR8string_tm       ## str_alloc(string_t&, unsigned long)
00000000000b5ac0	incq	0x8(%rbx)
00000000000b5ac4	movq	(%rbx), %rax
00000000000b5ac7	movb	$0x3a, (%rax,%r14)
00000000000b5acc	movl	0x8(%r13), %r15d
00000000000b5ad0	movq	0x8(%rbx), %r14
00000000000b5ad4	movq	0x10(%rbx), %rax
00000000000b5ad8	leaq	0x8(%r14), %rsi
00000000000b5adc	testq	%rax, %rax
00000000000b5adf	je	0xb5b10
00000000000b5ae1	cmpq	(%rax), %rsi
00000000000b5ae4	jb	0xb5b18
00000000000b5ae6	leaq	0x107(%r14), %r12
00000000000b5aed	andq	$-0x100, %r12
00000000000b5af4	movq	0x10(%rax), %rdi
00000000000b5af8	movq	%r12, %rsi
00000000000b5afb	callq	0x3c55ca                        ## symbol stub for: _realloc
00000000000b5b00	movq	0x10(%rbx), %rcx
00000000000b5b04	movq	%rax, 0x10(%rcx)
00000000000b5b08	movq	%r12, (%rcx)
00000000000b5b0b	movq	%rax, (%rbx)
00000000000b5b0e	jmp	0xb5b18
00000000000b5b10	movq	%rbx, %rdi
00000000000b5b13	callq	__ZL9str_allocR8string_tm       ## str_alloc(string_t&, unsigned long)
00000000000b5b18	movl	%r15d, %eax
00000000000b5b1b	shrl	$0x1c, %eax
00000000000b5b1e	leal	0x57(%rax), %ecx
00000000000b5b21	orb	$0x30, %al
00000000000b5b23	cmpl	$0xa0000000, %r15d              ## imm = 0xA0000000
00000000000b5b2a	movzbl	%al, %eax
00000000000b5b2d	movzbl	%cl, %ecx
00000000000b5b30	cmovbl	%eax, %ecx
00000000000b5b33	movd	%r15d, %xmm0
00000000000b5b38	pshufd	$0x0, %xmm0, %xmm1              ## xmm1 = xmm0[0,0,0,0]
00000000000b5b3d	movdqa	%xmm1, %xmm0
00000000000b5b41	psrld	$0xc, %xmm0
00000000000b5b46	movdqa	%xmm1, %xmm2
00000000000b5b4a	psrld	$0x14, %xmm2
00000000000b5b4f	pshufb	0x317e68(%rip), %xmm1
00000000000b5b58	pblendw	$0xf0, %xmm0, %xmm2             ## xmm2 = xmm2[0,1,2,3],xmm0[4,5,6,7]
00000000000b5b5e	pblendw	$0xcc, %xmm2, %xmm1             ## xmm1 = xmm1[0,1],xmm2[2,3],xmm1[4,5],xmm2[6,7]
00000000000b5b64	pand	0x317e64(%rip), %xmm1
00000000000b5b6c	movq	(%rbx), %rax
00000000000b5b6f	movdqa	%xmm1, %xmm0
00000000000b5b73	pcmpgtd	0x317e65(%rip), %xmm0
00000000000b5b7b	movdqa	0x317e6d(%rip), %xmm2
00000000000b5b83	por	%xmm1, %xmm2
00000000000b5b87	paddd	0x317e71(%rip), %xmm1
00000000000b5b8f	movb	%cl, (%rax,%r14)
00000000000b5b93	blendvps	%xmm0, %xmm1, %xmm2
00000000000b5b98	packusdw	%xmm2, %xmm2
00000000000b5b9d	packuswb	%xmm2, %xmm2
00000000000b5ba1	movl	%r15d, %ecx
00000000000b5ba4	shrl	$0x8, %ecx
00000000000b5ba7	andl	$0xf, %ecx
00000000000b5baa	leal	0x57(%rcx), %edx
00000000000b5bad	leal	0x30(%rcx), %esi
00000000000b5bb0	cmpl	$0xa, %ecx
00000000000b5bb3	movzbl	%sil, %ecx
00000000000b5bb7	movzbl	%dl, %edx
00000000000b5bba	cmovbl	%ecx, %edx
00000000000b5bbd	movd	%xmm2, 0x1(%rax,%r14)
00000000000b5bc4	movb	%dl, 0x5(%rax,%r14)
00000000000b5bc9	movl	%r15d, %ecx
00000000000b5bcc	shrl	$0x4, %ecx
00000000000b5bcf	andl	$0xf, %ecx
00000000000b5bd2	leal	0x57(%rcx), %edx
00000000000b5bd5	leal	0x30(%rcx), %esi
00000000000b5bd8	cmpl	$0xa, %ecx
00000000000b5bdb	movzbl	%sil, %ecx
00000000000b5bdf	movzbl	%dl, %edx
00000000000b5be2	cmovbl	%ecx, %edx
00000000000b5be5	andl	$0xf, %r15d
00000000000b5be9	leal	0x57(%r15), %ecx
00000000000b5bed	leal	0x30(%r15), %esi
00000000000b5bf1	cmpl	$0xa, %r15d
00000000000b5bf5	movzbl	%sil, %esi
00000000000b5bf9	movzbl	%cl, %ecx
00000000000b5bfc	cmovbl	%esi, %ecx
00000000000b5bff	movb	%dl, 0x6(%rax,%r14)
00000000000b5c04	movb	%cl, 0x7(%rax,%r14)
00000000000b5c09	movq	0x8(%rbx), %rsi
00000000000b5c0d	movq	0x10(%rbx), %rax
00000000000b5c11	leaq	0x8(%rsi), %r14
00000000000b5c15	movq	%r14, 0x8(%rbx)
00000000000b5c19	addq	$0x9, %rsi
00000000000b5c1d	testq	%rax, %rax
00000000000b5c20	je	0xb5c54
00000000000b5c22	cmpq	(%rax), %rsi
00000000000b5c25	jb	0xb5c5c
00000000000b5c27	movq	%r14, %r12
00000000000b5c2a	andq	$-0x100, %r12
00000000000b5c31	addq	$0x100, %r12                    ## imm = 0x100
00000000000b5c38	movq	0x10(%rax), %rdi
00000000000b5c3c	movq	%r12, %rsi
00000000000b5c3f	callq	0x3c55ca                        ## symbol stub for: _realloc
00000000000b5c44	movq	0x10(%rbx), %rcx
00000000000b5c48	movq	%rax, 0x10(%rcx)
00000000000b5c4c	movq	%r12, (%rcx)
00000000000b5c4f	movq	%rax, (%rbx)
00000000000b5c52	jmp	0xb5c5c
00000000000b5c54	movq	%rbx, %rdi
00000000000b5c57	callq	__ZL9str_allocR8string_tm       ## str_alloc(string_t&, unsigned long)
00000000000b5c5c	incq	0x8(%rbx)
00000000000b5c60	movq	(%rbx), %rax
00000000000b5c63	movb	$0x3a, (%rax,%r14)
00000000000b5c68	movl	0xc(%r13), %r15d
00000000000b5c6c	movq	0x8(%rbx), %r14
00000000000b5c70	movq	0x10(%rbx), %rax
00000000000b5c74	leaq	0x8(%r14), %rsi
00000000000b5c78	testq	%rax, %rax
00000000000b5c7b	je	0xb5cac
00000000000b5c7d	cmpq	(%rax), %rsi
00000000000b5c80	jb	0xb5cb4
00000000000b5c82	leaq	0x107(%r14), %r12
00000000000b5c89	andq	$-0x100, %r12
00000000000b5c90	movq	0x10(%rax), %rdi
00000000000b5c94	movq	%r12, %rsi
00000000000b5c97	callq	0x3c55ca                        ## symbol stub for: _realloc
00000000000b5c9c	movq	0x10(%rbx), %rcx
00000000000b5ca0	movq	%rax, 0x10(%rcx)
00000000000b5ca4	movq	%r12, (%rcx)
00000000000b5ca7	movq	%rax, (%rbx)
00000000000b5caa	jmp	0xb5cb4
00000000000b5cac	movq	%rbx, %rdi
00000000000b5caf	callq	__ZL9str_allocR8string_tm       ## str_alloc(string_t&, unsigned long)
00000000000b5cb4	movl	%r15d, %eax
00000000000b5cb7	shrl	$0x1c, %eax
00000000000b5cba	leal	0x57(%rax), %ecx
00000000000b5cbd	orb	$0x30, %al
00000000000b5cbf	cmpl	$0xa0000000, %r15d              ## imm = 0xA0000000
00000000000b5cc6	movzbl	%al, %eax
00000000000b5cc9	movzbl	%cl, %ecx
00000000000b5ccc	cmovbl	%eax, %ecx
00000000000b5ccf	movd	%r15d, %xmm0
00000000000b5cd4	pshufd	$0x0, %xmm0, %xmm1              ## xmm1 = xmm0[0,0,0,0]
00000000000b5cd9	movdqa	%xmm1, %xmm0
00000000000b5cdd	psrld	$0xc, %xmm0
00000000000b5ce2	movdqa	%xmm1, %xmm2
00000000000b5ce6	psrld	$0x14, %xmm2
00000000000b5ceb	pshufb	0x317ccc(%rip), %xmm1
00000000000b5cf4	pblendw	$0xf0, %xmm0, %xmm2             ## xmm2 = xmm2[0,1,2,3],xmm0[4,5,6,7]
00000000000b5cfa	pblendw	$0xcc, %xmm2, %xmm1             ## xmm1 = xmm1[0,1],xmm2[2,3],xmm1[4,5],xmm2[6,7]
00000000000b5d00	pand	0x317cc8(%rip), %xmm1
00000000000b5d08	movq	(%rbx), %rax
00000000000b5d0b	movdqa	%xmm1, %xmm0
00000000000b5d0f	pcmpgtd	0x317cc9(%rip), %xmm0
00000000000b5d17	movdqa	0x317cd1(%rip), %xmm2
00000000000b5d1f	por	%xmm1, %xmm2
00000000000b5d23	paddd	0x317cd5(%rip), %xmm1
00000000000b5d2b	movb	%cl, (%rax,%r14)
00000000000b5d2f	blendvps	%xmm0, %xmm1, %xmm2
00000000000b5d34	packusdw	%xmm2, %xmm2
00000000000b5d39	packuswb	%xmm2, %xmm2
00000000000b5d3d	movl	%r15d, %ecx
00000000000b5d40	shrl	$0x8, %ecx
00000000000b5d43	andl	$0xf, %ecx
00000000000b5d46	leal	0x57(%rcx), %edx
00000000000b5d49	leal	0x30(%rcx), %esi
00000000000b5d4c	cmpl	$0xa, %ecx
00000000000b5d4f	movzbl	%sil, %ecx
00000000000b5d53	movzbl	%dl, %edx
00000000000b5d56	cmovbl	%ecx, %edx
00000000000b5d59	movd	%xmm2, 0x1(%rax,%r14)
00000000000b5d60	movb	%dl, 0x5(%rax,%r14)
00000000000b5d65	movl	%r15d, %ecx
00000000000b5d68	shrl	$0x4, %ecx
00000000000b5d6b	andl	$0xf, %ecx
00000000000b5d6e	leal	0x57(%rcx), %edx
00000000000b5d71	leal	0x30(%rcx), %esi
00000000000b5d74	cmpl	$0xa, %ecx
00000000000b5d77	movzbl	%sil, %ecx
00000000000b5d7b	movzbl	%dl, %edx
00000000000b5d7e	cmovbl	%ecx, %edx
00000000000b5d81	andl	$0xf, %r15d
00000000000b5d85	leal	0x57(%r15), %ecx
00000000000b5d89	leal	0x30(%r15), %esi
00000000000b5d8d	cmpl	$0xa, %r15d
00000000000b5d91	movzbl	%sil, %esi
00000000000b5d95	movzbl	%cl, %ecx
00000000000b5d98	cmovbl	%esi, %ecx
00000000000b5d9b	movb	%dl, 0x6(%rax,%r14)
00000000000b5da0	movb	%cl, 0x7(%rax,%r14)
00000000000b5da5	movq	0x8(%rbx), %rsi
00000000000b5da9	movq	0x10(%rbx), %rax
00000000000b5dad	leaq	0x8(%rsi), %r14
00000000000b5db1	movq	%r14, 0x8(%rbx)
00000000000b5db5	addq	$0x9, %rsi
00000000000b5db9	testq	%rax, %rax
00000000000b5dbc	je	0xb5df0
00000000000b5dbe	cmpq	(%rax), %rsi
00000000000b5dc1	jb	0xb5df8
00000000000b5dc3	movq	%r14, %r12
00000000000b5dc6	andq	$-0x100, %r12
00000000000b5dcd	addq	$0x100, %r12                    ## imm = 0x100
00000000000b5dd4	movq	0x10(%rax), %rdi
00000000000b5dd8	movq	%r12, %rsi
00000000000b5ddb	callq	0x3c55ca                        ## symbol stub for: _realloc
00000000000b5de0	movq	0x10(%rbx), %rcx
00000000000b5de4	movq	%rax, 0x10(%rcx)
00000000000b5de8	movq	%r12, (%rcx)
00000000000b5deb	movq	%rax, (%rbx)
00000000000b5dee	jmp	0xb5df8
00000000000b5df0	movq	%rbx, %rdi
00000000000b5df3	callq	__ZL9str_allocR8string_tm       ## str_alloc(string_t&, unsigned long)
00000000000b5df8	incq	0x8(%rbx)
00000000000b5dfc	movq	(%rbx), %rax
00000000000b5dff	movb	$0x3a, (%rax,%r14)
00000000000b5e04	movl	0x10(%r13), %r15d
00000000000b5e08	movq	0x8(%rbx), %r14
00000000000b5e0c	movq	0x10(%rbx), %rax
00000000000b5e10	leaq	0x8(%r14), %rsi
00000000000b5e14	testq	%rax, %rax
00000000000b5e17	je	0xb5e48
00000000000b5e19	cmpq	(%rax), %rsi
00000000000b5e1c	jb	0xb5e50
00000000000b5e1e	leaq	0x107(%r14), %r12
00000000000b5e25	andq	$-0x100, %r12
00000000000b5e2c	movq	0x10(%rax), %rdi
00000000000b5e30	movq	%r12, %rsi
00000000000b5e33	callq	0x3c55ca                        ## symbol stub for: _realloc
00000000000b5e38	movq	0x10(%rbx), %rcx
00000000000b5e3c	movq	%rax, 0x10(%rcx)
00000000000b5e40	movq	%r12, (%rcx)
00000000000b5e43	movq	%rax, (%rbx)
00000000000b5e46	jmp	0xb5e50
00000000000b5e48	movq	%rbx, %rdi
00000000000b5e4b	callq	__ZL9str_allocR8string_tm       ## str_alloc(string_t&, unsigned long)
00000000000b5e50	movl	%r15d, %eax
00000000000b5e53	shrl	$0x1c, %eax
00000000000b5e56	leal	0x57(%rax), %ecx
00000000000b5e59	orb	$0x30, %al
00000000000b5e5b	cmpl	$0xa0000000, %r15d              ## imm = 0xA0000000
00000000000b5e62	movzbl	%al, %eax
00000000000b5e65	movzbl	%cl, %ecx
00000000000b5e68	cmovbl	%eax, %ecx
00000000000b5e6b	movd	%r15d, %xmm0
00000000000b5e70	pshufd	$0x0, %xmm0, %xmm1              ## xmm1 = xmm0[0,0,0,0]
00000000000b5e75	movdqa	%xmm1, %xmm0
00000000000b5e79	psrld	$0xc, %xmm0
00000000000b5e7e	movdqa	%xmm1, %xmm2
00000000000b5e82	psrld	$0x14, %xmm2
00000000000b5e87	pshufb	0x317b30(%rip), %xmm1
00000000000b5e90	pblendw	$0xf0, %xmm0, %xmm2             ## xmm2 = xmm2[0,1,2,3],xmm0[4,5,6,7]
00000000000b5e96	pblendw	$0xcc, %xmm2, %xmm1             ## xmm1 = xmm1[0,1],xmm2[2,3],xmm1[4,5],xmm2[6,7]
00000000000b5e9c	pand	0x317b2c(%rip), %xmm1
00000000000b5ea4	movq	(%rbx), %rax
00000000000b5ea7	movdqa	%xmm1, %xmm0
00000000000b5eab	pcmpgtd	0x317b2d(%rip), %xmm0
00000000000b5eb3	movdqa	0x317b35(%rip), %xmm2
00000000000b5ebb	por	%xmm1, %xmm2
00000000000b5ebf	paddd	0x317b39(%rip), %xmm1
00000000000b5ec7	movb	%cl, (%rax,%r14)
00000000000b5ecb	blendvps	%xmm0, %xmm1, %xmm2
00000000000b5ed0	packusdw	%xmm2, %xmm2
00000000000b5ed5	packuswb	%xmm2, %xmm2
00000000000b5ed9	movl	%r15d, %ecx
00000000000b5edc	shrl	$0x8, %ecx
00000000000b5edf	andl	$0xf, %ecx
00000000000b5ee2	leal	0x57(%rcx), %edx
00000000000b5ee5	leal	0x30(%rcx), %esi
00000000000b5ee8	cmpl	$0xa, %ecx
00000000000b5eeb	movzbl	%sil, %ecx
00000000000b5eef	movzbl	%dl, %edx
00000000000b5ef2	cmovbl	%ecx, %edx
00000000000b5ef5	movd	%xmm2, 0x1(%rax,%r14)
00000000000b5efc	movb	%dl, 0x5(%rax,%r14)
00000000000b5f01	movl	%r15d, %ecx
00000000000b5f04	shrl	$0x4, %ecx
00000000000b5f07	andl	$0xf, %ecx
00000000000b5f0a	leal	0x57(%rcx), %edx
00000000000b5f0d	leal	0x30(%rcx), %esi
00000000000b5f10	cmpl	$0xa, %ecx
00000000000b5f13	movzbl	%sil, %ecx
00000000000b5f17	movzbl	%dl, %edx
00000000000b5f1a	cmovbl	%ecx, %edx
00000000000b5f1d	andl	$0xf, %r15d
00000000000b5f21	leal	0x57(%r15), %ecx
00000000000b5f25	leal	0x30(%r15), %esi
00000000000b5f29	cmpl	$0xa, %r15d
00000000000b5f2d	movzbl	%sil, %esi
00000000000b5f31	movzbl	%cl, %ecx
00000000000b5f34	cmovbl	%esi, %ecx
00000000000b5f37	movb	%dl, 0x6(%rax,%r14)
00000000000b5f3c	movb	%cl, 0x7(%rax,%r14)
00000000000b5f41	movq	0x8(%rbx), %rsi
00000000000b5f45	movq	0x10(%rbx), %rax
00000000000b5f49	leaq	0x8(%rsi), %r14
00000000000b5f4d	movq	%r14, 0x8(%rbx)
00000000000b5f51	addq	$0x9, %rsi
00000000000b5f55	testq	%rax, %rax
00000000000b5f58	je	0xb5f8c
00000000000b5f5a	cmpq	(%rax), %rsi
00000000000b5f5d	jb	0xb5f94
00000000000b5f5f	movq	%r14, %r12
00000000000b5f62	andq	$-0x100, %r12
00000000000b5f69	addq	$0x100, %r12                    ## imm = 0x100
00000000000b5f70	movq	0x10(%rax), %rdi
00000000000b5f74	movq	%r12, %rsi
00000000000b5f77	callq	0x3c55ca                        ## symbol stub for: _realloc
00000000000b5f7c	movq	0x10(%rbx), %rcx
00000000000b5f80	movq	%rax, 0x10(%rcx)
00000000000b5f84	movq	%r12, (%rcx)
00000000000b5f87	movq	%rax, (%rbx)
00000000000b5f8a	jmp	0xb5f94
00000000000b5f8c	movq	%rbx, %rdi
00000000000b5f8f	callq	__ZL9str_allocR8string_tm       ## str_alloc(string_t&, unsigned long)
00000000000b5f94	incq	0x8(%rbx)
00000000000b5f98	movq	(%rbx), %rax
00000000000b5f9b	movb	$0x3a, (%rax,%r14)
00000000000b5fa0	movzwl	0x14(%r13), %r15d
00000000000b5fa5	movq	0x8(%rbx), %r14
00000000000b5fa9	movq	0x10(%rbx), %rax
00000000000b5fad	leaq	0x4(%r14), %rsi
00000000000b5fb1	testq	%rax, %rax
00000000000b5fb4	je	0xb5fe5
00000000000b5fb6	cmpq	(%rax), %rsi
00000000000b5fb9	jb	0xb5fed
00000000000b5fbb	leaq	0x103(%r14), %r12
00000000000b5fc2	andq	$-0x100, %r12
00000000000b5fc9	movq	0x10(%rax), %rdi
00000000000b5fcd	movq	%r12, %rsi
00000000000b5fd0	callq	0x3c55ca                        ## symbol stub for: _realloc
00000000000b5fd5	movq	0x10(%rbx), %rcx
00000000000b5fd9	movq	%rax, 0x10(%rcx)
00000000000b5fdd	movq	%r12, (%rcx)
00000000000b5fe0	movq	%rax, (%rbx)
00000000000b5fe3	jmp	0xb5fed
00000000000b5fe5	movq	%rbx, %rdi
00000000000b5fe8	callq	__ZL9str_allocR8string_tm       ## str_alloc(string_t&, unsigned long)
00000000000b5fed	movq	(%rbx), %rax
00000000000b5ff0	movl	%r15d, %ecx
00000000000b5ff3	shrl	$0xc, %ecx
00000000000b5ff6	leal	0x57(%rcx), %edx
00000000000b5ff9	orb	$0x30, %cl
00000000000b5ffc	cmpl	$0xa000, %r15d                  ## imm = 0xA000
00000000000b6003	movzbl	%cl, %ecx
00000000000b6006	movzbl	%dl, %edx
00000000000b6009	cmovbl	%ecx, %edx
00000000000b600c	movl	%r15d, %ecx
00000000000b600f	shrl	$0x8, %ecx
00000000000b6012	andl	$0xf, %ecx
00000000000b6015	leal	0x57(%rcx), %esi
00000000000b6018	cmpl	$0xa, %ecx
00000000000b601b	leal	0x30(%rcx), %ecx
00000000000b601e	movzbl	%cl, %ecx
00000000000b6021	movzbl	%sil, %esi
00000000000b6025	cmovbl	%ecx, %esi
00000000000b6028	movb	%dl, (%rax,%r14)
00000000000b602c	movb	%sil, 0x1(%rax,%r14)
00000000000b6031	movl	%r15d, %ecx
00000000000b6034	shrl	$0x4, %ecx
00000000000b6037	andl	$0xf, %ecx
00000000000b603a	leal	0x57(%rcx), %edx
00000000000b603d	leal	0x30(%rcx), %esi
00000000000b6040	cmpl	$0xa, %ecx
00000000000b6043	movzbl	%sil, %ecx
00000000000b6047	movzbl	%dl, %edx
00000000000b604a	cmovbl	%ecx, %edx
00000000000b604d	andl	$0xf, %r15d
00000000000b6051	leal	0x57(%r15), %ecx
00000000000b6055	leal	0x30(%r15), %esi
00000000000b6059	cmpl	$0xa, %r15d
00000000000b605d	movzbl	%sil, %esi
00000000000b6061	movzbl	%cl, %ecx
00000000000b6064	cmovbl	%esi, %ecx
00000000000b6067	movb	%dl, 0x2(%rax,%r14)
00000000000b606c	movb	%cl, 0x3(%rax,%r14)
00000000000b6071	movq	0x8(%rbx), %rsi
00000000000b6075	movq	0x10(%rbx), %rax
00000000000b6079	leaq	0x4(%rsi), %r14
00000000000b607d	movq	%r14, 0x8(%rbx)
00000000000b6081	addq	$0x5, %rsi
00000000000b6085	testq	%rax, %rax
00000000000b6088	je	0xb60bc
00000000000b608a	cmpq	(%rax), %rsi
00000000000b608d	jb	0xb60c4
00000000000b608f	movq	%r14, %r12
00000000000b6092	andq	$-0x100, %r12
00000000000b6099	addq	$0x100, %r12                    ## imm = 0x100
00000000000b60a0	movq	0x10(%rax), %rdi
00000000000b60a4	movq	%r12, %rsi
00000000000b60a7	callq	0x3c55ca                        ## symbol stub for: _realloc
00000000000b60ac	movq	0x10(%rbx), %rcx
00000000000b60b0	movq	%rax, 0x10(%rcx)
00000000000b60b4	movq	%r12, (%rcx)
00000000000b60b7	movq	%rax, (%rbx)
00000000000b60ba	jmp	0xb60c4
00000000000b60bc	movq	%rbx, %rdi
00000000000b60bf	callq	__ZL9str_allocR8string_tm       ## str_alloc(string_t&, unsigned long)
00000000000b60c4	incq	0x8(%rbx)
00000000000b60c8	movq	(%rbx), %rax
00000000000b60cb	movb	$0x3a, (%rax,%r14)
00000000000b60d0	movzwl	0x16(%r13), %r15d
00000000000b60d5	movq	0x8(%rbx), %r14
00000000000b60d9	movq	0x10(%rbx), %rax
00000000000b60dd	leaq	0x4(%r14), %rsi
00000000000b60e1	testq	%rax, %rax
00000000000b60e4	je	0xb6115
00000000000b60e6	cmpq	(%rax), %rsi
00000000000b60e9	jb	0xb611d
00000000000b60eb	leaq	0x103(%r14), %r12
00000000000b60f2	andq	$-0x100, %r12
00000000000b60f9	movq	0x10(%rax), %rdi
00000000000b60fd	movq	%r12, %rsi
00000000000b6100	callq	0x3c55ca                        ## symbol stub for: _realloc
00000000000b6105	movq	0x10(%rbx), %rcx
00000000000b6109	movq	%rax, 0x10(%rcx)
00000000000b610d	movq	%r12, (%rcx)
00000000000b6110	movq	%rax, (%rbx)
00000000000b6113	jmp	0xb611d
00000000000b6115	movq	%rbx, %rdi
00000000000b6118	callq	__ZL9str_allocR8string_tm       ## str_alloc(string_t&, unsigned long)
00000000000b611d	movq	(%rbx), %rax
00000000000b6120	movl	%r15d, %ecx
00000000000b6123	shrl	$0xc, %ecx
00000000000b6126	leal	0x57(%rcx), %edx
00000000000b6129	orb	$0x30, %cl
00000000000b612c	cmpl	$0xa000, %r15d                  ## imm = 0xA000
00000000000b6133	movzbl	%cl, %ecx
00000000000b6136	movzbl	%dl, %edx
00000000000b6139	cmovbl	%ecx, %edx
00000000000b613c	movl	%r15d, %ecx
00000000000b613f	shrl	$0x8, %ecx
00000000000b6142	andl	$0xf, %ecx
00000000000b6145	leal	0x57(%rcx), %esi
00000000000b6148	cmpl	$0xa, %ecx
00000000000b614b	leal	0x30(%rcx), %ecx
00000000000b614e	movzbl	%cl, %ecx
00000000000b6151	movzbl	%sil, %esi
00000000000b6155	cmovbl	%ecx, %esi
00000000000b6158	movb	%dl, (%rax,%r14)
00000000000b615c	movb	%sil, 0x1(%rax,%r14)
00000000000b6161	movl	%r15d, %ecx
00000000000b6164	shrl	$0x4, %ecx
00000000000b6167	andl	$0xf, %ecx
00000000000b616a	leal	0x57(%rcx), %edx
00000000000b616d	leal	0x30(%rcx), %esi
00000000000b6170	cmpl	$0xa, %ecx
00000000000b6173	movzbl	%sil, %ecx
00000000000b6177	movzbl	%dl, %edx
00000000000b617a	cmovbl	%ecx, %edx
00000000000b617d	andl	$0xf, %r15d
00000000000b6181	leal	0x57(%r15), %ecx
00000000000b6185	leal	0x30(%r15), %esi
00000000000b6189	cmpl	$0xa, %r15d
00000000000b618d	movzbl	%sil, %esi
00000000000b6191	movzbl	%cl, %ecx
00000000000b6194	cmovbl	%esi, %ecx
00000000000b6197	movb	%dl, 0x2(%rax,%r14)
00000000000b619c	movb	%cl, 0x3(%rax,%r14)
00000000000b61a1	movq	0x8(%rbx), %rsi
00000000000b61a5	movq	0x10(%rbx), %rax
00000000000b61a9	leaq	0x4(%rsi), %r14
00000000000b61ad	movq	%r14, 0x8(%rbx)
00000000000b61b1	addq	$0x5, %rsi
00000000000b61b5	testq	%rax, %rax
00000000000b61b8	je	0xb61ec
00000000000b61ba	cmpq	(%rax), %rsi
00000000000b61bd	jb	0xb61f4
00000000000b61bf	movq	%r14, %r12
00000000000b61c2	andq	$-0x100, %r12
00000000000b61c9	addq	$0x100, %r12                    ## imm = 0x100
00000000000b61d0	movq	0x10(%rax), %rdi
00000000000b61d4	movq	%r12, %rsi
00000000000b61d7	callq	0x3c55ca                        ## symbol stub for: _realloc
00000000000b61dc	movq	0x10(%rbx), %rcx
00000000000b61e0	movq	%rax, 0x10(%rcx)
00000000000b61e4	movq	%r12, (%rcx)
00000000000b61e7	movq	%rax, (%rbx)
00000000000b61ea	jmp	0xb61f4
00000000000b61ec	movq	%rbx, %rdi
00000000000b61ef	callq	__ZL9str_allocR8string_tm       ## str_alloc(string_t&, unsigned long)
00000000000b61f4	incq	0x8(%rbx)
00000000000b61f8	movq	(%rbx), %rax
00000000000b61fb	movb	$0x3a, (%rax,%r14)
00000000000b6200	movzwl	0x18(%r13), %r15d
00000000000b6205	movq	0x8(%rbx), %r14
00000000000b6209	movq	0x10(%rbx), %rax
00000000000b620d	leaq	0x4(%r14), %rsi
00000000000b6211	testq	%rax, %rax
00000000000b6214	je	0xb6245
00000000000b6216	cmpq	(%rax), %rsi
00000000000b6219	jb	0xb624d
00000000000b621b	leaq	0x103(%r14), %r12
00000000000b6222	andq	$-0x100, %r12
00000000000b6229	movq	0x10(%rax), %rdi
00000000000b622d	movq	%r12, %rsi
00000000000b6230	callq	0x3c55ca                        ## symbol stub for: _realloc
00000000000b6235	movq	0x10(%rbx), %rcx
00000000000b6239	movq	%rax, 0x10(%rcx)
00000000000b623d	movq	%r12, (%rcx)
00000000000b6240	movq	%rax, (%rbx)
00000000000b6243	jmp	0xb624d
00000000000b6245	movq	%rbx, %rdi
00000000000b6248	callq	__ZL9str_allocR8string_tm       ## str_alloc(string_t&, unsigned long)
00000000000b624d	movq	(%rbx), %rax
00000000000b6250	movl	%r15d, %ecx
00000000000b6253	shrl	$0xc, %ecx
00000000000b6256	leal	0x57(%rcx), %edx
00000000000b6259	orb	$0x30, %cl
00000000000b625c	cmpl	$0xa000, %r15d                  ## imm = 0xA000
00000000000b6263	movzbl	%cl, %ecx
00000000000b6266	movzbl	%dl, %edx
00000000000b6269	cmovbl	%ecx, %edx
00000000000b626c	movl	%r15d, %ecx
00000000000b626f	shrl	$0x8, %ecx
00000000000b6272	andl	$0xf, %ecx
00000000000b6275	leal	0x57(%rcx), %esi
00000000000b6278	cmpl	$0xa, %ecx
00000000000b627b	leal	0x30(%rcx), %ecx
00000000000b627e	movzbl	%cl, %ecx
00000000000b6281	movzbl	%sil, %esi
00000000000b6285	cmovbl	%ecx, %esi
00000000000b6288	movb	%dl, (%rax,%r14)
00000000000b628c	movb	%sil, 0x1(%rax,%r14)
00000000000b6291	movl	%r15d, %ecx
00000000000b6294	shrl	$0x4, %ecx
00000000000b6297	andl	$0xf, %ecx
00000000000b629a	leal	0x57(%rcx), %edx
00000000000b629d	leal	0x30(%rcx), %esi
00000000000b62a0	cmpl	$0xa, %ecx
00000000000b62a3	movzbl	%sil, %ecx
00000000000b62a7	movzbl	%dl, %edx
00000000000b62aa	cmovbl	%ecx, %edx
00000000000b62ad	andl	$0xf, %r15d
00000000000b62b1	leal	0x57(%r15), %ecx
00000000000b62b5	leal	0x30(%r15), %esi
00000000000b62b9	cmpl	$0xa, %r15d
00000000000b62bd	movzbl	%sil, %esi
00000000000b62c1	movzbl	%cl, %ecx
00000000000b62c4	cmovbl	%esi, %ecx
00000000000b62c7	movb	%dl, 0x2(%rax,%r14)
00000000000b62cc	movb	%cl, 0x3(%rax,%r14)
00000000000b62d1	movq	0x8(%rbx), %rsi
00000000000b62d5	movq	0x10(%rbx), %rax
00000000000b62d9	leaq	0x4(%rsi), %r14
00000000000b62dd	movq	%r14, 0x8(%rbx)
00000000000b62e1	addq	$0x5, %rsi
00000000000b62e5	testq	%rax, %rax
00000000000b62e8	je	0xb631c
00000000000b62ea	cmpq	(%rax), %rsi
00000000000b62ed	jb	0xb6324
00000000000b62ef	movq	%r14, %r12
00000000000b62f2	andq	$-0x100, %r12
00000000000b62f9	addq	$0x100, %r12                    ## imm = 0x100
00000000000b6300	movq	0x10(%rax), %rdi
00000000000b6304	movq	%r12, %rsi
00000000000b6307	callq	0x3c55ca                        ## symbol stub for: _realloc
00000000000b630c	movq	0x10(%rbx), %rcx
00000000000b6310	movq	%rax, 0x10(%rcx)
00000000000b6314	movq	%r12, (%rcx)
00000000000b6317	movq	%rax, (%rbx)
00000000000b631a	jmp	0xb6324
00000000000b631c	movq	%rbx, %rdi
00000000000b631f	callq	__ZL9str_allocR8string_tm       ## str_alloc(string_t&, unsigned long)
00000000000b6324	incq	0x8(%rbx)
00000000000b6328	movq	(%rbx), %rax
00000000000b632b	movb	$0x3a, (%rax,%r14)
00000000000b6330	movzbl	0x1a(%r13), %r15d
00000000000b6335	movq	0x8(%rbx), %r14
00000000000b6339	movq	0x10(%rbx), %rax
00000000000b633d	leaq	0x2(%r14), %rsi
00000000000b6341	testq	%rax, %rax
00000000000b6344	je	0xb6375
00000000000b6346	cmpq	(%rax), %rsi
00000000000b6349	jb	0xb637d
00000000000b634b	leaq	0x101(%r14), %r12
00000000000b6352	andq	$-0x100, %r12
00000000000b6359	movq	0x10(%rax), %rdi
00000000000b635d	movq	%r12, %rsi
00000000000b6360	callq	0x3c55ca                        ## symbol stub for: _realloc
00000000000b6365	movq	0x10(%rbx), %rcx
00000000000b6369	movq	%rax, 0x10(%rcx)
00000000000b636d	movq	%r12, (%rcx)
00000000000b6370	movq	%rax, (%rbx)
00000000000b6373	jmp	0xb637d
00000000000b6375	movq	%rbx, %rdi
00000000000b6378	callq	__ZL9str_allocR8string_tm       ## str_alloc(string_t&, unsigned long)
00000000000b637d	movq	(%rbx), %rax
00000000000b6380	movl	%r15d, %ecx
00000000000b6383	shrl	$0x4, %ecx
00000000000b6386	leal	0x57(%rcx), %edx
00000000000b6389	orb	$0x30, %cl
00000000000b638c	cmpb	$-0x60, %r15b
00000000000b6390	movzbl	%cl, %ecx
00000000000b6393	movzbl	%dl, %edx
00000000000b6396	cmovbl	%ecx, %edx
00000000000b6399	movb	%dl, (%rax,%r14)
00000000000b639d	andl	$0xf, %r15d
00000000000b63a1	leal	0x57(%r15), %ecx
00000000000b63a5	leal	0x30(%r15), %edx
00000000000b63a9	cmpl	$0xa, %r15d
00000000000b63ad	movzbl	%dl, %edx
00000000000b63b0	movzbl	%cl, %ecx
00000000000b63b3	cmovbl	%edx, %ecx
00000000000b63b6	movb	%cl, 0x1(%rax,%r14)
00000000000b63bb	movq	0x8(%rbx), %r12
00000000000b63bf	movq	0x10(%rbx), %rax
00000000000b63c3	leaq	0x2(%r12), %r14
00000000000b63c8	movq	%r14, 0x8(%rbx)
00000000000b63cc	movzbl	0x1b(%r13), %r15d
00000000000b63d1	leaq	0x4(%r12), %rsi
00000000000b63d6	testq	%rax, %rax
00000000000b63d9	je	0xb640a
00000000000b63db	cmpq	(%rax), %rsi
00000000000b63de	jb	0xb6412
00000000000b63e0	addq	$0x103, %r12                    ## imm = 0x103
00000000000b63e7	andq	$-0x100, %r12
00000000000b63ee	movq	0x10(%rax), %rdi
00000000000b63f2	movq	%r12, %rsi
00000000000b63f5	callq	0x3c55ca                        ## symbol stub for: _realloc
00000000000b63fa	movq	0x10(%rbx), %rcx
00000000000b63fe	movq	%rax, 0x10(%rcx)
00000000000b6402	movq	%r12, (%rcx)
00000000000b6405	movq	%rax, (%rbx)
00000000000b6408	jmp	0xb6412
00000000000b640a	movq	%rbx, %rdi
00000000000b640d	callq	__ZL9str_allocR8string_tm       ## str_alloc(string_t&, unsigned long)
00000000000b6412	movq	(%rbx), %rax
00000000000b6415	movl	%r15d, %ecx
00000000000b6418	shrl	$0x4, %ecx
00000000000b641b	leal	0x57(%rcx), %edx
00000000000b641e	orb	$0x30, %cl
00000000000b6421	cmpb	$-0x60, %r15b
00000000000b6425	movzbl	%cl, %ecx
00000000000b6428	movzbl	%dl, %edx
00000000000b642b	cmovbl	%ecx, %edx
00000000000b642e	andl	$0xf, %r15d
00000000000b6432	leal	0x57(%r15), %ecx
00000000000b6436	cmpl	$0xa, %r15d
00000000000b643a	leal	0x30(%r15), %esi
00000000000b643e	movzbl	%sil, %esi
00000000000b6442	movzbl	%cl, %ecx
00000000000b6445	cmovbl	%esi, %ecx
00000000000b6448	movb	%dl, (%rax,%r14)
00000000000b644c	movb	%cl, 0x1(%rax,%r14)
00000000000b6451	movq	0x8(%rbx), %rsi
00000000000b6455	movq	0x10(%rbx), %rax
00000000000b6459	leaq	0x2(%rsi), %r14
00000000000b645d	movq	%r14, 0x8(%rbx)
00000000000b6461	addq	$0x3, %rsi
00000000000b6465	testq	%rax, %rax
00000000000b6468	je	0xb649c
00000000000b646a	cmpq	(%rax), %rsi
00000000000b646d	jb	0xb64a4
00000000000b646f	movq	%r14, %r12
00000000000b6472	andq	$-0x100, %r12
00000000000b6479	addq	$0x100, %r12                    ## imm = 0x100
00000000000b6480	movq	0x10(%rax), %rdi
00000000000b6484	movq	%r12, %rsi
00000000000b6487	callq	0x3c55ca                        ## symbol stub for: _realloc
00000000000b648c	movq	0x10(%rbx), %rcx
00000000000b6490	movq	%rax, 0x10(%rcx)
00000000000b6494	movq	%r12, (%rcx)
00000000000b6497	movq	%rax, (%rbx)
00000000000b649a	jmp	0xb64a4
00000000000b649c	movq	%rbx, %rdi
00000000000b649f	callq	__ZL9str_allocR8string_tm       ## str_alloc(string_t&, unsigned long)
00000000000b64a4	incq	0x8(%rbx)
00000000000b64a8	movq	(%rbx), %rax
00000000000b64ab	movb	$0x3a, (%rax,%r14)
00000000000b64b0	movzbl	0x1c(%r13), %r15d
00000000000b64b5	movq	0x8(%rbx), %r14
00000000000b64b9	movq	0x10(%rbx), %rax
00000000000b64bd	leaq	0x2(%r14), %rsi
00000000000b64c1	testq	%rax, %rax
00000000000b64c4	je	0xb64f5
00000000000b64c6	cmpq	(%rax), %rsi
00000000000b64c9	jb	0xb64fd
00000000000b64cb	leaq	0x101(%r14), %r12
00000000000b64d2	andq	$-0x100, %r12
00000000000b64d9	movq	0x10(%rax), %rdi
00000000000b64dd	movq	%r12, %rsi
00000000000b64e0	callq	0x3c55ca                        ## symbol stub for: _realloc
00000000000b64e5	movq	0x10(%rbx), %rcx
00000000000b64e9	movq	%rax, 0x10(%rcx)
00000000000b64ed	movq	%r12, (%rcx)
00000000000b64f0	movq	%rax, (%rbx)
00000000000b64f3	jmp	0xb64fd
00000000000b64f5	movq	%rbx, %rdi
00000000000b64f8	callq	__ZL9str_allocR8string_tm       ## str_alloc(string_t&, unsigned long)
00000000000b64fd	movq	(%rbx), %rax
00000000000b6500	movl	%r15d, %ecx
00000000000b6503	shrl	$0x4, %ecx
00000000000b6506	leal	0x57(%rcx), %edx
00000000000b6509	orb	$0x30, %cl
00000000000b650c	cmpb	$-0x60, %r15b
00000000000b6510	movzbl	%cl, %ecx
00000000000b6513	movzbl	%dl, %edx
00000000000b6516	cmovbl	%ecx, %edx
00000000000b6519	movb	%dl, (%rax,%r14)
00000000000b651d	andl	$0xf, %r15d
00000000000b6521	leal	0x57(%r15), %ecx
00000000000b6525	leal	0x30(%r15), %edx
00000000000b6529	cmpl	$0xa, %r15d
00000000000b652d	movzbl	%dl, %edx
00000000000b6530	movzbl	%cl, %ecx
00000000000b6533	cmovbl	%edx, %ecx
00000000000b6536	movb	%cl, 0x1(%rax,%r14)
00000000000b653b	movq	0x8(%rbx), %r12
00000000000b653f	movq	0x10(%rbx), %rax
00000000000b6543	leaq	0x2(%r12), %r14
00000000000b6548	movq	%r14, 0x8(%rbx)
00000000000b654c	movzbl	0x1d(%r13), %r15d
00000000000b6551	leaq	0x4(%r12), %rsi
00000000000b6556	testq	%rax, %rax
00000000000b6559	je	0xb658a
00000000000b655b	cmpq	(%rax), %rsi
00000000000b655e	jb	0xb6592
00000000000b6560	addq	$0x103, %r12                    ## imm = 0x103
00000000000b6567	andq	$-0x100, %r12
00000000000b656e	movq	0x10(%rax), %rdi
00000000000b6572	movq	%r12, %rsi
00000000000b6575	callq	0x3c55ca                        ## symbol stub for: _realloc
00000000000b657a	movq	0x10(%rbx), %rcx
00000000000b657e	movq	%rax, 0x10(%rcx)
00000000000b6582	movq	%r12, (%rcx)
00000000000b6585	movq	%rax, (%rbx)
00000000000b6588	jmp	0xb6592
00000000000b658a	movq	%rbx, %rdi
00000000000b658d	callq	__ZL9str_allocR8string_tm       ## str_alloc(string_t&, unsigned long)
00000000000b6592	movq	(%rbx), %rax
00000000000b6595	movl	%r15d, %ecx
00000000000b6598	shrl	$0x4, %ecx
00000000000b659b	leal	0x57(%rcx), %edx
00000000000b659e	orb	$0x30, %cl
00000000000b65a1	cmpb	$-0x60, %r15b
00000000000b65a5	movzbl	%cl, %ecx
00000000000b65a8	movzbl	%dl, %edx
00000000000b65ab	cmovbl	%ecx, %edx
00000000000b65ae	andl	$0xf, %r15d
00000000000b65b2	leal	0x57(%r15), %ecx
00000000000b65b6	cmpl	$0xa, %r15d
00000000000b65ba	leal	0x30(%r15), %esi
00000000000b65be	movzbl	%sil, %esi
00000000000b65c2	movzbl	%cl, %ecx
00000000000b65c5	cmovbl	%esi, %ecx
00000000000b65c8	movb	%dl, (%rax,%r14)
00000000000b65cc	movb	%cl, 0x1(%rax,%r14)
00000000000b65d1	movq	0x8(%rbx), %rsi
00000000000b65d5	movq	0x10(%rbx), %rax
00000000000b65d9	leaq	0x2(%rsi), %r14
00000000000b65dd	movq	%r14, 0x8(%rbx)
00000000000b65e1	addq	$0x3, %rsi
00000000000b65e5	testq	%rax, %rax
00000000000b65e8	je	0xb661c
00000000000b65ea	cmpq	(%rax), %rsi
00000000000b65ed	jb	0xb6624
00000000000b65ef	movq	%r14, %r12
00000000000b65f2	andq	$-0x100, %r12
00000000000b65f9	addq	$0x100, %r12                    ## imm = 0x100
00000000000b6600	movq	0x10(%rax), %rdi
00000000000b6604	movq	%r12, %rsi
00000000000b6607	callq	0x3c55ca                        ## symbol stub for: _realloc
00000000000b660c	movq	0x10(%rbx), %rcx
00000000000b6610	movq	%rax, 0x10(%rcx)
00000000000b6614	movq	%r12, (%rcx)
00000000000b6617	movq	%rax, (%rbx)
00000000000b661a	jmp	0xb6624
00000000000b661c	movq	%rbx, %rdi
00000000000b661f	callq	__ZL9str_allocR8string_tm       ## str_alloc(string_t&, unsigned long)
00000000000b6624	incq	0x8(%rbx)
00000000000b6628	movq	(%rbx), %rax
00000000000b662b	movb	$0x3a, (%rax,%r14)
00000000000b6630	movzwl	0x1e(%r13), %r15d
00000000000b6635	movq	0x8(%rbx), %r14
00000000000b6639	movq	0x10(%rbx), %rax
00000000000b663d	leaq	0x4(%r14), %rsi
00000000000b6641	testq	%rax, %rax
00000000000b6644	je	0xb6675
00000000000b6646	cmpq	(%rax), %rsi
00000000000b6649	jb	0xb667d
00000000000b664b	leaq	0x103(%r14), %r12
00000000000b6652	andq	$-0x100, %r12
00000000000b6659	movq	0x10(%rax), %rdi
00000000000b665d	movq	%r12, %rsi
00000000000b6660	callq	0x3c55ca                        ## symbol stub for: _realloc
00000000000b6665	movq	0x10(%rbx), %rcx
00000000000b6669	movq	%rax, 0x10(%rcx)
00000000000b666d	movq	%r12, (%rcx)
00000000000b6670	movq	%rax, (%rbx)
00000000000b6673	jmp	0xb667d
00000000000b6675	movq	%rbx, %rdi
00000000000b6678	callq	__ZL9str_allocR8string_tm       ## str_alloc(string_t&, unsigned long)
00000000000b667d	movq	(%rbx), %rax
00000000000b6680	movl	%r15d, %ecx
00000000000b6683	shrl	$0xc, %ecx
00000000000b6686	leal	0x57(%rcx), %edx
00000000000b6689	orb	$0x30, %cl
00000000000b668c	cmpl	$0xa000, %r15d                  ## imm = 0xA000
00000000000b6693	movzbl	%cl, %ecx
00000000000b6696	movzbl	%dl, %edx
00000000000b6699	cmovbl	%ecx, %edx
00000000000b669c	movl	%r15d, %ecx
00000000000b669f	shrl	$0x8, %ecx
00000000000b66a2	andl	$0xf, %ecx
00000000000b66a5	leal	0x57(%rcx), %esi
00000000000b66a8	cmpl	$0xa, %ecx
00000000000b66ab	leal	0x30(%rcx), %ecx
00000000000b66ae	movzbl	%cl, %ecx
00000000000b66b1	movzbl	%sil, %esi
00000000000b66b5	cmovbl	%ecx, %esi
00000000000b66b8	movb	%dl, (%rax,%r14)
00000000000b66bc	movb	%sil, 0x1(%rax,%r14)
00000000000b66c1	movl	%r15d, %ecx
00000000000b66c4	shrl	$0x4, %ecx
00000000000b66c7	andl	$0xf, %ecx
00000000000b66ca	leal	0x57(%rcx), %edx
00000000000b66cd	leal	0x30(%rcx), %esi
00000000000b66d0	cmpl	$0xa, %ecx
00000000000b66d3	movzbl	%sil, %ecx
00000000000b66d7	movzbl	%dl, %edx
00000000000b66da	cmovbl	%ecx, %edx
00000000000b66dd	andl	$0xf, %r15d
00000000000b66e1	leal	0x57(%r15), %ecx
00000000000b66e5	leal	0x30(%r15), %esi
00000000000b66e9	cmpl	$0xa, %r15d
00000000000b66ed	movzbl	%sil, %esi
00000000000b66f1	movzbl	%cl, %ecx
00000000000b66f4	cmovbl	%esi, %ecx
00000000000b66f7	movb	%dl, 0x2(%rax,%r14)
00000000000b66fc	movb	%cl, 0x3(%rax,%r14)
00000000000b6701	movq	0x8(%rbx), %rsi
00000000000b6705	movq	0x10(%rbx), %rax
00000000000b6709	leaq	0x4(%rsi), %r14
00000000000b670d	movq	%r14, 0x8(%rbx)
00000000000b6711	addq	$0x5, %rsi
00000000000b6715	testq	%rax, %rax
00000000000b6718	je	0xb674c
00000000000b671a	cmpq	(%rax), %rsi
00000000000b671d	jb	0xb6754
00000000000b671f	movq	%r14, %r12
00000000000b6722	andq	$-0x100, %r12
00000000000b6729	addq	$0x100, %r12                    ## imm = 0x100
00000000000b6730	movq	0x10(%rax), %rdi
00000000000b6734	movq	%r12, %rsi
00000000000b6737	callq	0x3c55ca                        ## symbol stub for: _realloc
00000000000b673c	movq	0x10(%rbx), %rcx
00000000000b6740	movq	%rax, 0x10(%rcx)
00000000000b6744	movq	%r12, (%rcx)
00000000000b6747	movq	%rax, (%rbx)
00000000000b674a	jmp	0xb6754
00000000000b674c	movq	%rbx, %rdi
00000000000b674f	callq	__ZL9str_allocR8string_tm       ## str_alloc(string_t&, unsigned long)
00000000000b6754	incq	0x8(%rbx)
00000000000b6758	movq	(%rbx), %rax
00000000000b675b	movb	$0x3a, (%rax,%r14)
00000000000b6760	movzwl	0x20(%r13), %r15d
00000000000b6765	movq	0x8(%rbx), %r14
00000000000b6769	movq	0x10(%rbx), %rax
00000000000b676d	leaq	0x4(%r14), %rsi
00000000000b6771	testq	%rax, %rax
00000000000b6774	je	0xb67a5
00000000000b6776	cmpq	(%rax), %rsi
00000000000b6779	jb	0xb67ad
00000000000b677b	leaq	0x103(%r14), %r12
00000000000b6782	andq	$-0x100, %r12
00000000000b6789	movq	0x10(%rax), %rdi
00000000000b678d	movq	%r12, %rsi
00000000000b6790	callq	0x3c55ca                        ## symbol stub for: _realloc
00000000000b6795	movq	0x10(%rbx), %rcx
00000000000b6799	movq	%rax, 0x10(%rcx)
00000000000b679d	movq	%r12, (%rcx)
00000000000b67a0	movq	%rax, (%rbx)
00000000000b67a3	jmp	0xb67ad
00000000000b67a5	movq	%rbx, %rdi
00000000000b67a8	callq	__ZL9str_allocR8string_tm       ## str_alloc(string_t&, unsigned long)
00000000000b67ad	movq	(%rbx), %rax
00000000000b67b0	movl	%r15d, %ecx
00000000000b67b3	shrl	$0xc, %ecx
00000000000b67b6	leal	0x57(%rcx), %edx
00000000000b67b9	orb	$0x30, %cl
00000000000b67bc	cmpl	$0xa000, %r15d                  ## imm = 0xA000
00000000000b67c3	movzbl	%cl, %ecx
00000000000b67c6	movzbl	%dl, %edx
00000000000b67c9	cmovbl	%ecx, %edx
00000000000b67cc	movl	%r15d, %ecx
00000000000b67cf	shrl	$0x8, %ecx
00000000000b67d2	andl	$0xf, %ecx
00000000000b67d5	leal	0x57(%rcx), %esi
00000000000b67d8	cmpl	$0xa, %ecx
00000000000b67db	leal	0x30(%rcx), %ecx
00000000000b67de	movzbl	%cl, %ecx
00000000000b67e1	movzbl	%sil, %esi
00000000000b67e5	cmovbl	%ecx, %esi
00000000000b67e8	movb	%dl, (%rax,%r14)
00000000000b67ec	movb	%sil, 0x1(%rax,%r14)
00000000000b67f1	movl	%r15d, %ecx
00000000000b67f4	shrl	$0x4, %ecx
00000000000b67f7	andl	$0xf, %ecx
00000000000b67fa	leal	0x57(%rcx), %edx
00000000000b67fd	leal	0x30(%rcx), %esi
00000000000b6800	cmpl	$0xa, %ecx
00000000000b6803	movzbl	%sil, %ecx
00000000000b6807	movzbl	%dl, %edx
00000000000b680a	cmovbl	%ecx, %edx
00000000000b680d	andl	$0xf, %r15d
00000000000b6811	leal	0x57(%r15), %ecx
00000000000b6815	leal	0x30(%r15), %esi
00000000000b6819	cmpl	$0xa, %r15d
00000000000b681d	movzbl	%sil, %esi
00000000000b6821	movzbl	%cl, %ecx
00000000000b6824	cmovbl	%esi, %ecx
00000000000b6827	movb	%dl, 0x2(%rax,%r14)
00000000000b682c	movb	%cl, 0x3(%rax,%r14)
00000000000b6831	movq	0x8(%rbx), %rsi
00000000000b6835	movq	0x10(%rbx), %rax
00000000000b6839	leaq	0x4(%rsi), %r14
00000000000b683d	movq	%r14, 0x8(%rbx)
00000000000b6841	addq	$0x5, %rsi
00000000000b6845	testq	%rax, %rax
00000000000b6848	je	0xb687c
00000000000b684a	cmpq	(%rax), %rsi
00000000000b684d	jb	0xb6884
00000000000b684f	movq	%r14, %r12
00000000000b6852	andq	$-0x100, %r12
00000000000b6859	addq	$0x100, %r12                    ## imm = 0x100
00000000000b6860	movq	0x10(%rax), %rdi
00000000000b6864	movq	%r12, %rsi
00000000000b6867	callq	0x3c55ca                        ## symbol stub for: _realloc
00000000000b686c	movq	0x10(%rbx), %rcx
00000000000b6870	movq	%rax, 0x10(%rcx)
00000000000b6874	movq	%r12, (%rcx)
00000000000b6877	movq	%rax, (%rbx)
00000000000b687a	jmp	0xb6884
00000000000b687c	movq	%rbx, %rdi
00000000000b687f	callq	__ZL9str_allocR8string_tm       ## str_alloc(string_t&, unsigned long)
00000000000b6884	incq	0x8(%rbx)
00000000000b6888	movq	(%rbx), %rax
00000000000b688b	movb	$0x3a, (%rax,%r14)
00000000000b6890	movzwl	0x22(%r13), %r15d
00000000000b6895	movq	0x8(%rbx), %r14
00000000000b6899	movq	0x10(%rbx), %rax
00000000000b689d	leaq	0x4(%r14), %rsi
00000000000b68a1	testq	%rax, %rax
00000000000b68a4	je	0xb68d5
00000000000b68a6	cmpq	(%rax), %rsi
00000000000b68a9	jb	0xb68dd
00000000000b68ab	leaq	0x103(%r14), %r12
00000000000b68b2	andq	$-0x100, %r12
00000000000b68b9	movq	0x10(%rax), %rdi
00000000000b68bd	movq	%r12, %rsi
00000000000b68c0	callq	0x3c55ca                        ## symbol stub for: _realloc
00000000000b68c5	movq	0x10(%rbx), %rcx
00000000000b68c9	movq	%rax, 0x10(%rcx)
00000000000b68cd	movq	%r12, (%rcx)
00000000000b68d0	movq	%rax, (%rbx)
00000000000b68d3	jmp	0xb68dd
00000000000b68d5	movq	%rbx, %rdi
00000000000b68d8	callq	__ZL9str_allocR8string_tm       ## str_alloc(string_t&, unsigned long)
00000000000b68dd	movq	(%rbx), %rax
00000000000b68e0	movl	%r15d, %ecx
00000000000b68e3	shrl	$0xc, %ecx
00000000000b68e6	leal	0x57(%rcx), %edx
00000000000b68e9	orb	$0x30, %cl
00000000000b68ec	cmpl	$0xa000, %r15d                  ## imm = 0xA000
00000000000b68f3	movzbl	%cl, %ecx
00000000000b68f6	movzbl	%dl, %edx
00000000000b68f9	cmovbl	%ecx, %edx
00000000000b68fc	movl	%r15d, %ecx
00000000000b68ff	shrl	$0x8, %ecx
00000000000b6902	andl	$0xf, %ecx
00000000000b6905	leal	0x57(%rcx), %esi
00000000000b6908	cmpl	$0xa, %ecx
00000000000b690b	leal	0x30(%rcx), %ecx
00000000000b690e	movzbl	%cl, %ecx
00000000000b6911	movzbl	%sil, %esi
00000000000b6915	cmovbl	%ecx, %esi
00000000000b6918	movb	%dl, (%rax,%r14)
00000000000b691c	movb	%sil, 0x1(%rax,%r14)
00000000000b6921	movl	%r15d, %ecx
00000000000b6924	shrl	$0x4, %ecx
00000000000b6927	andl	$0xf, %ecx
00000000000b692a	leal	0x57(%rcx), %edx
00000000000b692d	leal	0x30(%rcx), %esi
00000000000b6930	cmpl	$0xa, %ecx
00000000000b6933	movzbl	%sil, %ecx
00000000000b6937	movzbl	%dl, %edx
00000000000b693a	cmovbl	%ecx, %edx
00000000000b693d	andl	$0xf, %r15d
00000000000b6941	leal	0x57(%r15), %ecx
00000000000b6945	leal	0x30(%r15), %esi
00000000000b6949	cmpl	$0xa, %r15d
00000000000b694d	movzbl	%sil, %esi
00000000000b6951	movzbl	%cl, %ecx
00000000000b6954	cmovbl	%esi, %ecx
00000000000b6957	movb	%dl, 0x2(%rax,%r14)
00000000000b695c	movb	%cl, 0x3(%rax,%r14)
00000000000b6961	movq	0x8(%rbx), %rsi
00000000000b6965	movq	0x10(%rbx), %rax
00000000000b6969	leaq	0x4(%rsi), %r14
00000000000b696d	movq	%r14, 0x8(%rbx)
00000000000b6971	addq	$0x5, %rsi
00000000000b6975	testq	%rax, %rax
00000000000b6978	je	0xb69ac
00000000000b697a	cmpq	(%rax), %rsi
00000000000b697d	jb	0xb69b4
00000000000b697f	movq	%r14, %r12
00000000000b6982	andq	$-0x100, %r12
00000000000b6989	addq	$0x100, %r12                    ## imm = 0x100
00000000000b6990	movq	0x10(%rax), %rdi
00000000000b6994	movq	%r12, %rsi
00000000000b6997	callq	0x3c55ca                        ## symbol stub for: _realloc
00000000000b699c	movq	0x10(%rbx), %rcx
00000000000b69a0	movq	%rax, 0x10(%rcx)
00000000000b69a4	movq	%r12, (%rcx)
00000000000b69a7	movq	%rax, (%rbx)
00000000000b69aa	jmp	0xb69b4
00000000000b69ac	movq	%rbx, %rdi
00000000000b69af	callq	__ZL9str_allocR8string_tm       ## str_alloc(string_t&, unsigned long)
00000000000b69b4	incq	0x8(%rbx)
00000000000b69b8	movq	(%rbx), %rax
00000000000b69bb	movb	$0x3a, (%rax,%r14)
00000000000b69c0	movzwl	0x24(%r13), %r15d
00000000000b69c5	movq	0x8(%rbx), %r14
00000000000b69c9	movq	0x10(%rbx), %rax
00000000000b69cd	leaq	0x4(%r14), %rsi
00000000000b69d1	testq	%rax, %rax
00000000000b69d4	je	0xb6a05
00000000000b69d6	cmpq	(%rax), %rsi
00000000000b69d9	jb	0xb6a0d
00000000000b69db	leaq	0x103(%r14), %r12
00000000000b69e2	andq	$-0x100, %r12
00000000000b69e9	movq	0x10(%rax), %rdi
00000000000b69ed	movq	%r12, %rsi
00000000000b69f0	callq	0x3c55ca                        ## symbol stub for: _realloc
00000000000b69f5	movq	0x10(%rbx), %rcx
00000000000b69f9	movq	%rax, 0x10(%rcx)
00000000000b69fd	movq	%r12, (%rcx)
00000000000b6a00	movq	%rax, (%rbx)
00000000000b6a03	jmp	0xb6a0d
00000000000b6a05	movq	%rbx, %rdi
00000000000b6a08	callq	__ZL9str_allocR8string_tm       ## str_alloc(string_t&, unsigned long)
00000000000b6a0d	movq	(%rbx), %rax
00000000000b6a10	movl	%r15d, %ecx
00000000000b6a13	shrl	$0xc, %ecx
00000000000b6a16	leal	0x57(%rcx), %edx
00000000000b6a19	orb	$0x30, %cl
00000000000b6a1c	cmpl	$0xa000, %r15d                  ## imm = 0xA000
00000000000b6a23	movzbl	%cl, %ecx
00000000000b6a26	movzbl	%dl, %edx
00000000000b6a29	cmovbl	%ecx, %edx
00000000000b6a2c	movl	%r15d, %ecx
00000000000b6a2f	shrl	$0x8, %ecx
00000000000b6a32	andl	$0xf, %ecx
00000000000b6a35	leal	0x57(%rcx), %esi
00000000000b6a38	cmpl	$0xa, %ecx
00000000000b6a3b	leal	0x30(%rcx), %ecx
00000000000b6a3e	movzbl	%cl, %ecx
00000000000b6a41	movzbl	%sil, %esi
00000000000b6a45	cmovbl	%ecx, %esi
00000000000b6a48	movb	%dl, (%rax,%r14)
00000000000b6a4c	movb	%sil, 0x1(%rax,%r14)
00000000000b6a51	movl	%r15d, %ecx
00000000000b6a54	shrl	$0x4, %ecx
00000000000b6a57	andl	$0xf, %ecx
00000000000b6a5a	leal	0x57(%rcx), %edx
00000000000b6a5d	leal	0x30(%rcx), %esi
00000000000b6a60	cmpl	$0xa, %ecx
00000000000b6a63	movzbl	%sil, %ecx
00000000000b6a67	movzbl	%dl, %edx
00000000000b6a6a	cmovbl	%ecx, %edx
00000000000b6a6d	andl	$0xf, %r15d
00000000000b6a71	leal	0x57(%r15), %ecx
00000000000b6a75	leal	0x30(%r15), %esi
00000000000b6a79	cmpl	$0xa, %r15d
00000000000b6a7d	movzbl	%sil, %esi
00000000000b6a81	movzbl	%cl, %ecx
00000000000b6a84	cmovbl	%esi, %ecx
00000000000b6a87	movb	%dl, 0x2(%rax,%r14)
00000000000b6a8c	movb	%cl, 0x3(%rax,%r14)
00000000000b6a91	movq	0x8(%rbx), %rsi
00000000000b6a95	movq	0x10(%rbx), %rax
00000000000b6a99	leaq	0x4(%rsi), %r14
00000000000b6a9d	movq	%r14, 0x8(%rbx)
00000000000b6aa1	addq	$0x5, %rsi
00000000000b6aa5	testq	%rax, %rax
00000000000b6aa8	je	0xb6adc
00000000000b6aaa	cmpq	(%rax), %rsi
00000000000b6aad	jb	0xb6ae4
00000000000b6aaf	movq	%r14, %r12
00000000000b6ab2	andq	$-0x100, %r12
00000000000b6ab9	addq	$0x100, %r12                    ## imm = 0x100
00000000000b6ac0	movq	0x10(%rax), %rdi
00000000000b6ac4	movq	%r12, %rsi
00000000000b6ac7	callq	0x3c55ca                        ## symbol stub for: _realloc
00000000000b6acc	movq	0x10(%rbx), %rcx
00000000000b6ad0	movq	%rax, 0x10(%rcx)
00000000000b6ad4	movq	%r12, (%rcx)
00000000000b6ad7	movq	%rax, (%rbx)
00000000000b6ada	jmp	0xb6ae4
00000000000b6adc	movq	%rbx, %rdi
00000000000b6adf	callq	__ZL9str_allocR8string_tm       ## str_alloc(string_t&, unsigned long)
00000000000b6ae4	incq	0x8(%rbx)
00000000000b6ae8	movq	(%rbx), %rax
00000000000b6aeb	movb	$0x3a, (%rax,%r14)
00000000000b6af0	movzbl	0x28(%r13), %r15d
00000000000b6af5	movq	0x8(%rbx), %r14
00000000000b6af9	movq	0x10(%rbx), %rax
00000000000b6afd	leaq	0x2(%r14), %rsi
00000000000b6b01	testq	%rax, %rax
00000000000b6b04	je	0xb6b35
00000000000b6b06	cmpq	(%rax), %rsi
00000000000b6b09	jb	0xb6b3d
00000000000b6b0b	leaq	0x101(%r14), %r12
00000000000b6b12	andq	$-0x100, %r12
00000000000b6b19	movq	0x10(%rax), %rdi
00000000000b6b1d	movq	%r12, %rsi
00000000000b6b20	callq	0x3c55ca                        ## symbol stub for: _realloc
00000000000b6b25	movq	0x10(%rbx), %rcx
00000000000b6b29	movq	%rax, 0x10(%rcx)
00000000000b6b2d	movq	%r12, (%rcx)
00000000000b6b30	movq	%rax, (%rbx)
00000000000b6b33	jmp	0xb6b3d
00000000000b6b35	movq	%rbx, %rdi
00000000000b6b38	callq	__ZL9str_allocR8string_tm       ## str_alloc(string_t&, unsigned long)
00000000000b6b3d	movq	(%rbx), %rax
00000000000b6b40	movl	%r15d, %ecx
00000000000b6b43	shrl	$0x4, %ecx
00000000000b6b46	leal	0x57(%rcx), %edx
00000000000b6b49	orb	$0x30, %cl
00000000000b6b4c	cmpb	$-0x60, %r15b
00000000000b6b50	movzbl	%cl, %ecx
00000000000b6b53	movzbl	%dl, %edx
00000000000b6b56	cmovbl	%ecx, %edx
00000000000b6b59	andl	$0xf, %r15d
00000000000b6b5d	leal	0x57(%r15), %ecx
00000000000b6b61	cmpl	$0xa, %r15d
00000000000b6b65	leal	0x30(%r15), %esi
00000000000b6b69	movzbl	%sil, %esi
00000000000b6b6d	movzbl	%cl, %ecx
00000000000b6b70	cmovbl	%esi, %ecx
00000000000b6b73	movb	%dl, (%rax,%r14)
00000000000b6b77	movb	%cl, 0x1(%rax,%r14)
00000000000b6b7c	movq	0x8(%rbx), %rsi
00000000000b6b80	movq	0x10(%rbx), %rax
00000000000b6b84	leaq	0x2(%rsi), %r14
00000000000b6b88	movq	%r14, 0x8(%rbx)
00000000000b6b8c	addq	$0x3, %rsi
00000000000b6b90	testq	%rax, %rax
00000000000b6b93	je	0xb6bc7
00000000000b6b95	cmpq	(%rax), %rsi
00000000000b6b98	jb	0xb6bcf
00000000000b6b9a	movq	%r14, %r12
00000000000b6b9d	andq	$-0x100, %r12
00000000000b6ba4	addq	$0x100, %r12                    ## imm = 0x100
00000000000b6bab	movq	0x10(%rax), %rdi
00000000000b6baf	movq	%r12, %rsi
00000000000b6bb2	callq	0x3c55ca                        ## symbol stub for: _realloc
00000000000b6bb7	movq	0x10(%rbx), %rcx
00000000000b6bbb	movq	%rax, 0x10(%rcx)
00000000000b6bbf	movq	%r12, (%rcx)
00000000000b6bc2	movq	%rax, (%rbx)
00000000000b6bc5	jmp	0xb6bcf
00000000000b6bc7	movq	%rbx, %rdi
00000000000b6bca	callq	__ZL9str_allocR8string_tm       ## str_alloc(string_t&, unsigned long)
00000000000b6bcf	incq	0x8(%rbx)
00000000000b6bd3	movq	(%rbx), %rax
00000000000b6bd6	movb	$0x3a, (%rax,%r14)
00000000000b6bdb	movzbl	0x29(%r13), %r15d
00000000000b6be0	movq	0x8(%rbx), %r14
00000000000b6be4	movq	0x10(%rbx), %rax
00000000000b6be8	leaq	0x1(%r14), %rsi
00000000000b6bec	testq	%rax, %rax
00000000000b6bef	je	0xb6c23
00000000000b6bf1	cmpq	(%rax), %rsi
00000000000b6bf4	jb	0xb6c2b
00000000000b6bf6	movq	%r14, %r12
00000000000b6bf9	andq	$-0x100, %r12
00000000000b6c00	addq	$0x100, %r12                    ## imm = 0x100
00000000000b6c07	movq	0x10(%rax), %rdi
00000000000b6c0b	movq	%r12, %rsi
00000000000b6c0e	callq	0x3c55ca                        ## symbol stub for: _realloc
00000000000b6c13	movq	0x10(%rbx), %rcx
00000000000b6c17	movq	%rax, 0x10(%rcx)
00000000000b6c1b	movq	%r12, (%rcx)
00000000000b6c1e	movq	%rax, (%rbx)
00000000000b6c21	jmp	0xb6c2b
00000000000b6c23	movq	%rbx, %rdi
00000000000b6c26	callq	__ZL9str_allocR8string_tm       ## str_alloc(string_t&, unsigned long)
00000000000b6c2b	andb	$0xf, %r15b
00000000000b6c2f	leal	0x30(%r15), %eax
00000000000b6c33	leal	0x57(%r15), %ecx
00000000000b6c37	cmpb	$0xa, %r15b
00000000000b6c3b	movzbl	%al, %eax
00000000000b6c3e	movzbl	%cl, %ecx
00000000000b6c41	cmovbl	%eax, %ecx
00000000000b6c44	movq	(%rbx), %rax
00000000000b6c47	movb	%cl, (%rax,%r14)
00000000000b6c4b	movq	0x8(%rbx), %rsi
00000000000b6c4f	movq	0x10(%rbx), %rax
00000000000b6c53	leaq	0x1(%rsi), %r14
00000000000b6c57	movq	%r14, 0x8(%rbx)
00000000000b6c5b	addq	$0x2, %rsi
00000000000b6c5f	testq	%rax, %rax
00000000000b6c62	je	0xb6c96
00000000000b6c64	cmpq	(%rax), %rsi
00000000000b6c67	jb	0xb6c9e
00000000000b6c69	movq	%r14, %r12
00000000000b6c6c	andq	$-0x100, %r12
00000000000b6c73	addq	$0x100, %r12                    ## imm = 0x100
00000000000b6c7a	movq	0x10(%rax), %rdi
00000000000b6c7e	movq	%r12, %rsi
00000000000b6c81	callq	0x3c55ca                        ## symbol stub for: _realloc
00000000000b6c86	movq	0x10(%rbx), %rcx
00000000000b6c8a	movq	%rax, 0x10(%rcx)
00000000000b6c8e	movq	%r12, (%rcx)
00000000000b6c91	movq	%rax, (%rbx)
00000000000b6c94	jmp	0xb6c9e
00000000000b6c96	movq	%rbx, %rdi
00000000000b6c99	callq	__ZL9str_allocR8string_tm       ## str_alloc(string_t&, unsigned long)
00000000000b6c9e	incq	0x8(%rbx)
00000000000b6ca2	movq	(%rbx), %rax
00000000000b6ca5	movb	$0x3a, (%rax,%r14)
00000000000b6caa	movzbl	0x2a(%r13), %r15d
00000000000b6caf	movq	0x8(%rbx), %r14
00000000000b6cb3	movq	0x10(%rbx), %rax
00000000000b6cb7	leaq	0x1(%r14), %rsi
00000000000b6cbb	testq	%rax, %rax
00000000000b6cbe	je	0xb6cf2
00000000000b6cc0	cmpq	(%rax), %rsi
00000000000b6cc3	jb	0xb6cfa
00000000000b6cc5	movq	%r14, %r12
00000000000b6cc8	andq	$-0x100, %r12
00000000000b6ccf	addq	$0x100, %r12                    ## imm = 0x100
00000000000b6cd6	movq	0x10(%rax), %rdi
00000000000b6cda	movq	%r12, %rsi
00000000000b6cdd	callq	0x3c55ca                        ## symbol stub for: _realloc
00000000000b6ce2	movq	0x10(%rbx), %rcx
00000000000b6ce6	movq	%rax, 0x10(%rcx)
00000000000b6cea	movq	%r12, (%rcx)
00000000000b6ced	movq	%rax, (%rbx)
00000000000b6cf0	jmp	0xb6cfa
00000000000b6cf2	movq	%rbx, %rdi
00000000000b6cf5	callq	__ZL9str_allocR8string_tm       ## str_alloc(string_t&, unsigned long)
00000000000b6cfa	andb	$0xf, %r15b
00000000000b6cfe	leal	0x30(%r15), %eax
00000000000b6d02	leal	0x57(%r15), %ecx
00000000000b6d06	cmpb	$0xa, %r15b
00000000000b6d0a	movzbl	%al, %eax
00000000000b6d0d	movzbl	%cl, %ecx
00000000000b6d10	cmovbl	%eax, %ecx
00000000000b6d13	movq	(%rbx), %rax
00000000000b6d16	movb	%cl, (%rax,%r14)
00000000000b6d1a	movq	0x8(%rbx), %rsi
00000000000b6d1e	movq	0x10(%rbx), %rax
00000000000b6d22	leaq	0x1(%rsi), %r14
00000000000b6d26	movq	%r14, 0x8(%rbx)
00000000000b6d2a	addq	$0x2, %rsi
00000000000b6d2e	testq	%rax, %rax
00000000000b6d31	je	0xb6d65
00000000000b6d33	cmpq	(%rax), %rsi
00000000000b6d36	jb	0xb6d6d
00000000000b6d38	movq	%r14, %r12
00000000000b6d3b	andq	$-0x100, %r12
00000000000b6d42	addq	$0x100, %r12                    ## imm = 0x100
00000000000b6d49	movq	0x10(%rax), %rdi
00000000000b6d4d	movq	%r12, %rsi
00000000000b6d50	callq	0x3c55ca                        ## symbol stub for: _realloc
00000000000b6d55	movq	0x10(%rbx), %rcx
00000000000b6d59	movq	%rax, 0x10(%rcx)
00000000000b6d5d	movq	%r12, (%rcx)
00000000000b6d60	movq	%rax, (%rbx)
00000000000b6d63	jmp	0xb6d6d
00000000000b6d65	movq	%rbx, %rdi
00000000000b6d68	callq	__ZL9str_allocR8string_tm       ## str_alloc(string_t&, unsigned long)
00000000000b6d6d	incq	0x8(%rbx)
00000000000b6d71	movq	(%rbx), %rax
00000000000b6d74	movb	$0x3a, (%rax,%r14)
00000000000b6d79	movzbl	0x2b(%r13), %r12d
00000000000b6d7e	movq	0x8(%rbx), %r14
00000000000b6d82	movq	0x10(%rbx), %rax
00000000000b6d86	leaq	0x1(%r14), %rsi
00000000000b6d8a	testq	%rax, %rax
00000000000b6d8d	je	0xb6dc1
00000000000b6d8f	cmpq	(%rax), %rsi
00000000000b6d92	jb	0xb6dc9
00000000000b6d94	movq	%r14, %r15
00000000000b6d97	andq	$-0x100, %r15
00000000000b6d9e	addq	$0x100, %r15                    ## imm = 0x100
00000000000b6da5	movq	0x10(%rax), %rdi
00000000000b6da9	movq	%r15, %rsi
00000000000b6dac	callq	0x3c55ca                        ## symbol stub for: _realloc
00000000000b6db1	movq	0x10(%rbx), %rcx
00000000000b6db5	movq	%rax, 0x10(%rcx)
00000000000b6db9	movq	%r15, (%rcx)
00000000000b6dbc	movq	%rax, (%rbx)
00000000000b6dbf	jmp	0xb6dc9
00000000000b6dc1	movq	%rbx, %rdi
00000000000b6dc4	callq	__ZL9str_allocR8string_tm       ## str_alloc(string_t&, unsigned long)
00000000000b6dc9	andb	$0xf, %r12b
00000000000b6dcd	leal	0x30(%r12), %eax
00000000000b6dd2	leal	0x57(%r12), %ecx
00000000000b6dd7	cmpb	$0xa, %r12b
00000000000b6ddb	movzbl	%al, %eax
00000000000b6dde	movzbl	%cl, %ecx
00000000000b6de1	cmovbl	%eax, %ecx
00000000000b6de4	movq	(%rbx), %rax
00000000000b6de7	movb	%cl, (%rax,%r14)
00000000000b6deb	movq	0x8(%rbx), %rsi
00000000000b6def	movq	0x10(%rbx), %rax
00000000000b6df3	leaq	0x1(%rsi), %r14
00000000000b6df7	movq	%r14, 0x8(%rbx)
00000000000b6dfb	addq	$0x2, %rsi
00000000000b6dff	testq	%rax, %rax
00000000000b6e02	je	0xb6e36
00000000000b6e04	cmpq	(%rax), %rsi
00000000000b6e07	jb	0xb6e3e
00000000000b6e09	movq	%r14, %r15
00000000000b6e0c	andq	$-0x100, %r15
00000000000b6e13	addq	$0x100, %r15                    ## imm = 0x100
00000000000b6e1a	movq	0x10(%rax), %rdi
00000000000b6e1e	movq	%r15, %rsi
00000000000b6e21	callq	0x3c55ca                        ## symbol stub for: _realloc
00000000000b6e26	movq	0x10(%rbx), %rcx
00000000000b6e2a	movq	%rax, 0x10(%rcx)
00000000000b6e2e	movq	%r15, (%rcx)
00000000000b6e31	movq	%rax, (%rbx)
00000000000b6e34	jmp	0xb6e3e
00000000000b6e36	movq	%rbx, %rdi
00000000000b6e39	callq	__ZL9str_allocR8string_tm       ## str_alloc(string_t&, unsigned long)
00000000000b6e3e	incq	0x8(%rbx)
00000000000b6e42	movq	(%rbx), %rax
00000000000b6e45	movb	$0xa, (%rax,%r14)
00000000000b6e4a	cmpb	$0x0, -0x34(%rbp)
00000000000b6e4e	je	0xb6e5f
00000000000b6e50	addq	$0x18, %rsp
00000000000b6e54	popq	%rbx
00000000000b6e55	popq	%r12
00000000000b6e57	popq	%r13
00000000000b6e59	popq	%r14
00000000000b6e5b	popq	%r15
00000000000b6e5d	popq	%rbp
00000000000b6e5e	retq
00000000000b6e5f	movq	%rbx, %rdi
00000000000b6e62	addq	$0x18, %rsp
00000000000b6e66	popq	%rbx
00000000000b6e67	popq	%r12
00000000000b6e69	popq	%r13
00000000000b6e6b	popq	%r14
00000000000b6e6d	popq	%r15
00000000000b6e6f	popq	%rbp
00000000000b6e70	jmp	__ZL9str_closeR8string_t        ## str_close(string_t&)
00000000000b6e75	nopw	%cs:(%rax,%rax)
