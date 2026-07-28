__ZNK27FFAVFCompositionAudioCursor21presentationTimeStampEv:
0000000000df2390	pushq	%rbp
0000000000df2391	movq	%rsp, %rbp
0000000000df2394	pushq	%r14
0000000000df2396	pushq	%rbx
0000000000df2397	subq	$0x50, %rsp
0000000000df239b	movq	%rsi, %r14
0000000000df239e	movq	%rdi, %rbx
0000000000df23a1	movq	0xaf6f48(%rip), %rax            ## literal pool symbol address: _kCMTimeInvalid
0000000000df23a8	movq	0x10(%rax), %rcx
0000000000df23ac	movq	%rcx, 0x10(%rdi)
0000000000df23b0	movups	(%rax), %xmm0
0000000000df23b3	movups	%xmm0, (%rdi)
0000000000df23b6	cmpq	$0x0, 0x50(%rsi)
0000000000df23bb	je	0xdf23dc
0000000000df23bd	movq	0x10(%r14), %rsi
0000000000df23c1	addq	$0x50, %r14
0000000000df23c5	testq	%rsi, %rsi
0000000000df23c8	je	0xdf23f7
0000000000df23ca	movq	0xe011ff(%rip), %rdx
0000000000df23d1	leaq	-0x30(%rbp), %rdi
0000000000df23d5	callq	0x1497986                       ## symbol stub for: _objc_msgSend_stret
0000000000df23da	jmp	0xdf2406
0000000000df23dc	movq	0x10(%r14), %rsi
0000000000df23e0	testq	%rsi, %rsi
0000000000df23e3	je	0xdf2433
0000000000df23e5	movq	0xe011e4(%rip), %rdx
0000000000df23ec	leaq	-0x30(%rbp), %rdi
0000000000df23f0	callq	0x1497986                       ## symbol stub for: _objc_msgSend_stret
0000000000df23f5	jmp	0xdf2442
0000000000df23f7	xorps	%xmm0, %xmm0
0000000000df23fa	movaps	%xmm0, -0x30(%rbp)
0000000000df23fe	movq	$0x0, -0x20(%rbp)
0000000000df2406	movq	0x10(%r14), %rax
0000000000df240a	movq	%rax, 0x28(%rsp)
0000000000df240f	movups	(%r14), %xmm0
0000000000df2413	movups	%xmm0, 0x18(%rsp)
0000000000df2418	movq	-0x20(%rbp), %rax
0000000000df241c	movq	%rax, 0x10(%rsp)
0000000000df2421	movaps	-0x30(%rbp), %xmm0
0000000000df2425	movups	%xmm0, (%rsp)
0000000000df2429	movq	%rbx, %rdi
0000000000df242c	callq	0x14950fa                       ## symbol stub for: _CMTimeAdd
0000000000df2431	jmp	0xdf2451
0000000000df2433	xorps	%xmm0, %xmm0
0000000000df2436	movaps	%xmm0, -0x30(%rbp)
0000000000df243a	movq	$0x0, -0x20(%rbp)
0000000000df2442	movq	-0x20(%rbp), %rax
0000000000df2446	movq	%rax, 0x10(%rbx)
0000000000df244a	movaps	-0x30(%rbp), %xmm0
0000000000df244e	movups	%xmm0, (%rbx)
0000000000df2451	movq	%rbx, %rax
0000000000df2454	addq	$0x50, %rsp
0000000000df2458	popq	%rbx
0000000000df2459	popq	%r14
0000000000df245b	popq	%rbp
0000000000df245c	retq
0000000000df245d	nopl	(%rax)
