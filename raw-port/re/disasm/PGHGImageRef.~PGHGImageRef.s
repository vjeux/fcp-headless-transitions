__ZN12PGHGImageRefD0Ev:
000000000050c380	pushq	%rbp
000000000050c381	movq	%rsp, %rbp
000000000050c384	pushq	%r14
000000000050c386	pushq	%rbx
000000000050c387	leaq	__ZTV12PGHGImageRef(%rip), %rax ## vtable for PGHGImageRef
000000000050c38e	addq	$0x10, %rax
000000000050c392	movq	%rax, (%rdi)
000000000050c395	movq	0x18(%rdi), %rbx
000000000050c399	testq	%rbx, %rbx
000000000050c39c	je	0x50c3c7
000000000050c39e	movq	$-0x1, %rax
000000000050c3a5	lock
000000000050c3a6	xaddq	%rax, 0x8(%rbx)
000000000050c3ab	testq	%rax, %rax
000000000050c3ae	jne	0x50c3c7
000000000050c3b0	movq	(%rbx), %rax
000000000050c3b3	movq	%rdi, %r14
000000000050c3b6	movq	%rbx, %rdi
000000000050c3b9	callq	*0x10(%rax)
000000000050c3bc	movq	%rbx, %rdi
000000000050c3bf	callq	0x6dfbbe                        ## symbol stub for: __ZNSt3__119__shared_weak_count14__release_weakEv
000000000050c3c4	movq	%r14, %rdi
000000000050c3c7	movq	%rdi, %rbx
000000000050c3ca	callq	0x6def64                        ## symbol stub for: __ZN8HGObjectD2Ev
000000000050c3cf	movq	%rbx, %rdi
000000000050c3d2	popq	%rbx
000000000050c3d3	popq	%r14
000000000050c3d5	popq	%rbp
000000000050c3d6	jmp	0x6def6a                        ## symbol stub for: __ZN8HGObjectdlEPv
000000000050c3db	nopl	(%rax,%rax)
