__ZN12OZHGAudioJobD0Ev:
0000000000636a20	pushq	%rbp
0000000000636a21	movq	%rsp, %rbp
0000000000636a24	pushq	%r14
0000000000636a26	pushq	%rbx
0000000000636a27	leaq	0x2519a2(%rip), %rax
0000000000636a2e	movq	%rax, (%rdi)
0000000000636a31	movq	0x110(%rdi), %rbx
0000000000636a38	testq	%rbx, %rbx
0000000000636a3b	je	0x636a66
0000000000636a3d	movq	$-0x1, %rax
0000000000636a44	lock
0000000000636a45	xaddq	%rax, 0x8(%rbx)
0000000000636a4a	testq	%rax, %rax
0000000000636a4d	jne	0x636a66
0000000000636a4f	movq	(%rbx), %rax
0000000000636a52	movq	%rdi, %r14
0000000000636a55	movq	%rbx, %rdi
0000000000636a58	callq	*0x10(%rax)
0000000000636a5b	movq	%rbx, %rdi
0000000000636a5e	callq	0x6dfbbe                        ## symbol stub for: __ZNSt3__119__shared_weak_count14__release_weakEv
0000000000636a63	movq	%r14, %rdi
0000000000636a66	movq	%rdi, %rbx
0000000000636a69	callq	__ZN11OZHGUserJobD2Ev           ## OZHGUserJob::~OZHGUserJob()
0000000000636a6e	movq	%rbx, %rdi
0000000000636a71	popq	%rbx
0000000000636a72	popq	%r14
0000000000636a74	popq	%rbp
0000000000636a75	jmp	0x6def6a                        ## symbol stub for: __ZN8HGObjectdlEPv
0000000000636a7a	nopw	(%rax,%rax)
