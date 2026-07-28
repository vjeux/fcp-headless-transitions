__ZN19LiTextureStoreTokenD1Ev:
000000000002cae0	pushq	%rbp
000000000002cae1	movq	%rsp, %rbp
000000000002cae4	pushq	%rbx
000000000002cae5	pushq	%rax
000000000002cae6	movq	0x8(%rdi), %rbx
000000000002caea	testq	%rbx, %rbx
000000000002caed	je	0x2cb01
000000000002caef	movq	$-0x1, %rax
000000000002caf6	lock
000000000002caf7	xaddq	%rax, 0x8(%rbx)
000000000002cafc	testq	%rax, %rax
000000000002caff	je	0x2cb08
000000000002cb01	addq	$0x8, %rsp
000000000002cb05	popq	%rbx
000000000002cb06	popq	%rbp
000000000002cb07	retq
000000000002cb08	movq	(%rbx), %rax
000000000002cb0b	movq	%rbx, %rdi
000000000002cb0e	callq	*0x10(%rax)
000000000002cb11	movq	%rbx, %rdi
000000000002cb14	addq	$0x8, %rsp
000000000002cb18	popq	%rbx
000000000002cb19	popq	%rbp
000000000002cb1a	jmp	0x6dfbbe                        ## symbol stub for: __ZNSt3__119__shared_weak_count14__release_weakEv
000000000002cb1f	nop
