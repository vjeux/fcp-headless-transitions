__ZN9HGStencil10RenderTileEP6HGTile:
00000000002d2250	pushq	%rbp
00000000002d2251	movq	%rsp, %rbp
00000000002d2254	pushq	%r15
00000000002d2256	pushq	%r14
00000000002d2258	pushq	%r13
00000000002d225a	pushq	%r12
00000000002d225c	pushq	%rbx
00000000002d225d	subq	$0x28, %rsp
00000000002d2261	movq	%rsi, %r14
00000000002d2264	movq	%rdi, %rbx
00000000002d2267	movq	0x150(%rsi), %rax
00000000002d226e	movl	0xa0(%rax), %r15d
00000000002d2275	movq	(%rdi), %rax
00000000002d2278	movl	%r15d, %esi
00000000002d227b	callq	*0x230(%rax)
00000000002d2281	cmpq	$0x0, 0x50(%r14)
00000000002d2286	je	0x2d22d3
00000000002d2288	cmpq	$0x0, 0x60(%r14)
00000000002d228d	je	0x2d22d3
00000000002d228f	movss	0x1b0(%rbx), %xmm0
00000000002d2297	xorps	%xmm1, %xmm1
00000000002d229a	ucomiss	%xmm1, %xmm0
00000000002d229d	jbe	0x2d22d3
00000000002d229f	movslq	%r15d, %rax
00000000002d22a2	movslq	0x1b4(%rbx), %rcx
00000000002d22a9	leaq	__ZL20s_func_stencil_table(%rip), %r8 ## s_func_stencil_table
00000000002d22b0	movq	0x198(%rbx), %rdx
00000000002d22b7	movq	(%rdx,%rax,8), %rsi
00000000002d22bb	movq	%r14, %rdi
00000000002d22be	movq	%rbx, %rdx
00000000002d22c1	addq	$0x28, %rsp
00000000002d22c5	popq	%rbx
00000000002d22c6	popq	%r12
00000000002d22c8	popq	%r13
00000000002d22ca	popq	%r14
00000000002d22cc	popq	%r15
00000000002d22ce	popq	%rbp
00000000002d22cf	jmpq	*(%r8,%rcx,8)
00000000002d22d3	movq	%r14, %rdi
00000000002d22d6	callq	__ZNK6HGTile8RendererEv         ## HGTile::Renderer() const
00000000002d22db	movq	%rax, %rdi
00000000002d22de	xorl	%esi, %esi
00000000002d22e0	callq	__ZN10HGRenderer9GetTargetEj    ## HGRenderer::GetTarget(unsigned int)
00000000002d22e5	cmpl	$0x4700000, %eax                ## imm = 0x4700000
00000000002d22ea	jb	0x2d22f9
00000000002d22ec	movq	%r14, %rdi
00000000002d22ef	callq	__ZL23GetHGBlendClearTile_AVXP6HGTilePN13HGLegacyBlend5StateEP6HGNode ## GetHGBlendClearTile_AVX(HGTile*, HGLegacyBlend::State*, HGNode*)
00000000002d22f4	jmp	0x2d240a
00000000002d22f9	movl	0x4(%r14), %ecx
00000000002d22fd	movl	0xc(%r14), %edx
00000000002d2301	movl	%edx, %r15d
00000000002d2304	subl	%ecx, %r15d
00000000002d2307	jle	0x2d240a
00000000002d230d	movl	0x8(%r14), %eax
00000000002d2311	subl	(%r14), %eax
00000000002d2314	movq	0x10(%r14), %rbx
00000000002d2318	movslq	0x18(%r14), %r8
00000000002d231c	cmpl	$0x2, %eax
00000000002d231f	jl	0x2d2379
00000000002d2321	movq	%rax, -0x30(%rbp)
00000000002d2325	addl	$-0x2, %eax
00000000002d2328	movl	%eax, %r14d
00000000002d232b	shrl	%r14d
00000000002d232e	shlq	$0x5, %r14
00000000002d2332	addq	$0x20, %r14
00000000002d2336	andl	$-0x2, %eax
00000000002d2339	addl	$0x2, %eax
00000000002d233c	incl	%ecx
00000000002d233e	cmpl	%ecx, %edx
00000000002d2340	jne	0x2d241b
00000000002d2346	movq	%rax, %r13
00000000002d2349	testb	$0x1, %r15b
00000000002d234d	je	0x2d240a
00000000002d2353	movq	%rbx, %rdi
00000000002d2356	movq	%r14, %rsi
00000000002d2359	callq	0x3c4fca                        ## symbol stub for: ___bzero
00000000002d235e	cmpl	%r13d, -0x30(%rbp)
00000000002d2362	jle	0x2d240a
00000000002d2368	shlq	$0x4, %r13
00000000002d236c	xorps	%xmm0, %xmm0
00000000002d236f	movaps	%xmm0, (%rbx,%r13)
00000000002d2374	jmp	0x2d240a
00000000002d2379	cmpl	$0x1, %eax
00000000002d237c	jne	0x2d240a
00000000002d2382	movl	%r15d, %eax
00000000002d2385	andl	$0x7, %eax
00000000002d2388	subl	%edx, %ecx
00000000002d238a	cmpl	$-0x8, %ecx
00000000002d238d	ja	0x2d23f3
00000000002d238f	andl	$0x7ffffff8, %r15d              ## imm = 0x7FFFFFF8
00000000002d2396	movq	%r8, %rcx
00000000002d2399	shlq	$0x7, %rcx
00000000002d239d	movq	%r8, %rdx
00000000002d23a0	shlq	$0x4, %rdx
00000000002d23a4	xorps	%xmm0, %xmm0
00000000002d23a7	leaq	(%rdx,%rdx), %rsi
00000000002d23ab	nopl	(%rax,%rax)
00000000002d23b0	movq	%rbx, %rdi
00000000002d23b3	movaps	%xmm0, (%rbx)
00000000002d23b6	addq	%rdx, %rbx
00000000002d23b9	movaps	%xmm0, (%rdi,%rdx)
00000000002d23bd	movaps	%xmm0, (%rdx,%rbx)
00000000002d23c1	addq	%rdx, %rbx
00000000002d23c4	movaps	%xmm0, (%rdx,%rbx)
00000000002d23c8	addq	%rdx, %rbx
00000000002d23cb	movaps	%xmm0, (%rdx,%rbx)
00000000002d23cf	addq	%rdx, %rbx
00000000002d23d2	movaps	%xmm0, (%rdx,%rbx)
00000000002d23d6	addq	%rdx, %rbx
00000000002d23d9	movaps	%xmm0, (%rdx,%rbx)
00000000002d23dd	addq	%rdx, %rbx
00000000002d23e0	movaps	%xmm0, (%rdx,%rbx)
00000000002d23e4	addq	%rsi, %rbx
00000000002d23e7	addl	$-0x8, %r15d
00000000002d23eb	jne	0x2d23b0
00000000002d23ed	addq	%rcx, %rdi
00000000002d23f0	movq	%rdi, %rbx
00000000002d23f3	testl	%eax, %eax
00000000002d23f5	je	0x2d240a
00000000002d23f7	shlq	$0x4, %r8
00000000002d23fb	xorps	%xmm0, %xmm0
00000000002d23fe	nop
00000000002d2400	movaps	%xmm0, (%rbx)
00000000002d2403	addq	%r8, %rbx
00000000002d2406	decl	%eax
00000000002d2408	jne	0x2d2400
00000000002d240a	xorl	%eax, %eax
00000000002d240c	addq	$0x28, %rsp
00000000002d2410	popq	%rbx
00000000002d2411	popq	%r12
00000000002d2413	popq	%r13
00000000002d2415	popq	%r14
00000000002d2417	popq	%r15
00000000002d2419	popq	%rbp
00000000002d241a	retq
00000000002d241b	movl	%r15d, %r12d
00000000002d241e	andl	$0x7ffffffe, %r12d              ## imm = 0x7FFFFFFE
00000000002d2425	movq	%rax, %r13
00000000002d2428	movq	%rax, %rcx
00000000002d242b	shlq	$0x4, %rcx
00000000002d242f	movq	%r8, %rax
00000000002d2432	shlq	$0x5, %rax
00000000002d2436	movq	%rax, -0x48(%rbp)
00000000002d243a	shlq	$0x4, %r8
00000000002d243e	movq	%r8, -0x50(%rbp)
00000000002d2442	movq	%rcx, -0x40(%rbp)
00000000002d2446	leaq	(%r8,%rcx), %rax
00000000002d244a	movq	%rax, -0x38(%rbp)
00000000002d244e	jmp	0x2d245e
00000000002d2450	addq	-0x48(%rbp), %rbx
00000000002d2454	addl	$-0x2, %r12d
00000000002d2458	je	0x2d2349
00000000002d245e	movq	%rbx, %rdi
00000000002d2461	movq	%r14, %rsi
00000000002d2464	callq	0x3c4fca                        ## symbol stub for: ___bzero
00000000002d2469	cmpl	%r13d, -0x30(%rbp)
00000000002d246d	jle	0x2d247a
00000000002d246f	movq	-0x40(%rbp), %rax
00000000002d2473	xorps	%xmm0, %xmm0
00000000002d2476	movaps	%xmm0, (%rbx,%rax)
00000000002d247a	movq	-0x50(%rbp), %rax
00000000002d247e	leaq	(%rbx,%rax), %rdi
00000000002d2482	movq	%r14, %rsi
00000000002d2485	callq	0x3c4fca                        ## symbol stub for: ___bzero
00000000002d248a	cmpl	%r13d, -0x30(%rbp)
00000000002d248e	jle	0x2d2450
00000000002d2490	movq	-0x38(%rbp), %rax
00000000002d2494	xorps	%xmm0, %xmm0
00000000002d2497	movaps	%xmm0, (%rbx,%rax)
00000000002d249b	jmp	0x2d2450
00000000002d249d	nopl	(%rax)
