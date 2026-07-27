__ZN12PGHGImageRefD1Ev:
000000000050c320	pushq	%rbp
000000000050c321	movq	%rsp, %rbp
000000000050c324	pushq	%r14
000000000050c326	pushq	%rbx
000000000050c327	leaq	__ZTV12PGHGImageRef(%rip), %rax ## vtable for PGHGImageRef
000000000050c32e	addq	$0x10, %rax
000000000050c332	movq	%rax, (%rdi)
000000000050c335	movq	0x18(%rdi), %rbx
000000000050c339	testq	%rbx, %rbx
000000000050c33c	je	0x50c350
000000000050c33e	movq	$-0x1, %rax
000000000050c345	lock
000000000050c346	xaddq	%rax, 0x8(%rbx)
000000000050c34b	testq	%rax, %rax
000000000050c34e	je	0x50c359
000000000050c350	popq	%rbx
000000000050c351	popq	%r14
000000000050c353	popq	%rbp
000000000050c354	jmp	0x6def64                        ## symbol stub for: __ZN8HGObjectD2Ev
000000000050c359	movq	(%rbx), %rax
000000000050c35c	movq	%rdi, %r14
000000000050c35f	movq	%rbx, %rdi
000000000050c362	callq	*0x10(%rax)
000000000050c365	movq	%rbx, %rdi
000000000050c368	callq	0x6dfbbe                        ## symbol stub for: __ZNSt3__119__shared_weak_count14__release_weakEv
000000000050c36d	movq	%r14, %rdi
000000000050c370	popq	%rbx
000000000050c371	popq	%r14
000000000050c373	popq	%rbp
000000000050c374	jmp	0x6def64                        ## symbol stub for: __ZN8HGObjectD2Ev
000000000050c379	nopl	(%rax)
