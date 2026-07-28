__ZN18DummyMaterialLayerD0Ev:
00000000001e3760	pushq	%rbp
00000000001e3761	movq	%rsp, %rbp
00000000001e3764	pushq	%r15
00000000001e3766	pushq	%r14
00000000001e3768	pushq	%rbx
00000000001e3769	pushq	%rax
00000000001e376a	movq	%rdi, %rbx
00000000001e376d	leaq	0x65fd74(%rip), %rax
00000000001e3774	movq	%rax, (%rdi)
00000000001e3777	leaq	0x65fdd2(%rip), %rax
00000000001e377e	movq	%rax, 0x38(%rdi)
00000000001e3782	movq	0x20(%rdi), %r14
00000000001e3786	testq	%r14, %r14
00000000001e3789	je	0x1e37c5
00000000001e378b	movq	0x28(%rbx), %rdi
00000000001e378f	movq	%r14, %rax
00000000001e3792	cmpq	%rdi, %r14
00000000001e3795	je	0x1e37b9
00000000001e3797	nopw	(%rax,%rax)
00000000001e37a0	leaq	-0x10(%rdi), %r15
00000000001e37a4	addq	$-0x8, %rdi
00000000001e37a8	callq	0x6ddaee                        ## symbol stub for: __ZN13PCSharedCountD1Ev
00000000001e37ad	movq	%r15, %rdi
00000000001e37b0	cmpq	%r14, %r15
00000000001e37b3	jne	0x1e37a0
00000000001e37b5	movq	0x20(%rbx), %rax
00000000001e37b9	movq	%r14, 0x28(%rbx)
00000000001e37bd	movq	%rax, %rdi
00000000001e37c0	callq	0x6dfc36                        ## symbol stub for: __ZdlPv
00000000001e37c5	leaq	__ZTV13PCShared_base(%rip), %rax ## vtable for PCShared_base
00000000001e37cc	addq	$0x10, %rax
00000000001e37d0	movq	%rax, 0x38(%rbx)
00000000001e37d4	movq	0x40(%rbx), %rdi
00000000001e37d8	testq	%rdi, %rdi
00000000001e37db	je	0x1e37e2
00000000001e37dd	callq	0x6de4fc                        ## symbol stub for: __ZN18PC_Sp_counted_base12weak_releaseEv
00000000001e37e2	movq	%rbx, %rdi
00000000001e37e5	addq	$0x8, %rsp
00000000001e37e9	popq	%rbx
00000000001e37ea	popq	%r14
00000000001e37ec	popq	%r15
00000000001e37ee	popq	%rbp
00000000001e37ef	jmp	0x6dfc36                        ## symbol stub for: __ZdlPv
00000000001e37f4	movq	%rax, %rdi
00000000001e37f7	callq	___clang_call_terminate
00000000001e37fc	nopl	(%rax)
