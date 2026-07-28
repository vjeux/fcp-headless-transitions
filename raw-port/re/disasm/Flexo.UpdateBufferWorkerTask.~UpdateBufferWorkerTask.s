__ZN22UpdateBufferWorkerTaskD0Ev:
0000000000d0ef30	pushq	%rbp
0000000000d0ef31	movq	%rsp, %rbp
0000000000d0ef34	pushq	%r14
0000000000d0ef36	pushq	%rbx
0000000000d0ef37	movq	%rdi, %rbx
0000000000d0ef3a	leaq	0xc0258f(%rip), %rax
0000000000d0ef41	movq	%rax, (%rdi)
0000000000d0ef44	movq	0x38(%rdi), %rdi
0000000000d0ef48	movq	0x40(%rbx), %rdx
0000000000d0ef4c	movq	0xee2185(%rip), %rsi
0000000000d0ef53	callq	*0xbde767(%rip)                 ## Objc message: -[%rdi _notifyOfFirstDrawing:]
0000000000d0ef59	movq	0x38(%rbx), %rdi
0000000000d0ef5d	callq	*0xbde7a5(%rip)                 ## literal pool symbol address: _objc_release
0000000000d0ef63	movq	0x40(%rbx), %rdi
0000000000d0ef67	callq	*0xbde79b(%rip)                 ## literal pool symbol address: _objc_release
0000000000d0ef6d	movq	0x18(%rbx), %r14
0000000000d0ef71	testq	%r14, %r14
0000000000d0ef74	je	0xd0ef99
0000000000d0ef76	movq	$-0x1, %rax
0000000000d0ef7d	lock
0000000000d0ef7e	xaddq	%rax, 0x8(%r14)
0000000000d0ef83	testq	%rax, %rax
0000000000d0ef86	jne	0xd0ef99
0000000000d0ef88	movq	(%r14), %rax
0000000000d0ef8b	movq	%r14, %rdi
0000000000d0ef8e	callq	*0x10(%rax)
0000000000d0ef91	movq	%r14, %rdi
0000000000d0ef94	callq	0x1497398                       ## symbol stub for: __ZNSt3__119__shared_weak_count14__release_weakEv
0000000000d0ef99	movq	%rbx, %rdi
0000000000d0ef9c	popq	%rbx
0000000000d0ef9d	popq	%r14
0000000000d0ef9f	popq	%rbp
0000000000d0efa0	jmp	0x1497404                       ## symbol stub for: __ZdlPv
0000000000d0efa5	movq	%rax, %rdi
0000000000d0efa8	callq	___clang_call_terminate
0000000000d0efad	nopl	(%rax)
