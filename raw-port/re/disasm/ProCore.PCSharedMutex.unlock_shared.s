__ZN13PCSharedMutex13unlock_sharedEv:
00000000000ad25a	pushq	%rbp
00000000000ad25b	movq	%rsp, %rbp
00000000000ad25e	pushq	%r15
00000000000ad260	pushq	%r14
00000000000ad262	pushq	%rbx
00000000000ad263	pushq	%rax
00000000000ad264	movq	%rdi, %rbx
00000000000ad267	callq	0xdeada                         ## symbol stub for: _pthread_self
00000000000ad26c	movq	%rax, %r15
00000000000ad26f	movq	%rbx, %rdi
00000000000ad272	callq	0xde654                         ## symbol stub for: __ZNSt3__15mutex4lockEv
00000000000ad277	movq	0x40(%rbx), %rax
00000000000ad27b	cmpq	%rax, %r15
00000000000ad27e	je	0xad2ab
00000000000ad280	movq	0x50(%rbx), %r14
00000000000ad284	movq	0x58(%rbx), %rax
00000000000ad288	cmpq	%rax, %r14
00000000000ad28b	je	0xad2dd
00000000000ad28d	movq	%rax, %rdx
00000000000ad290	subq	%r14, %rdx
00000000000ad293	addq	$-0x14, %rdx
00000000000ad297	cmpq	(%r14), %r15
00000000000ad29a	je	0xad2b0
00000000000ad29c	addq	$0x10, %r14
00000000000ad2a0	addq	$-0x10, %rdx
00000000000ad2a4	cmpq	%rax, %r14
00000000000ad2a7	jne	0xad297
00000000000ad2a9	jmp	0xad2dd
00000000000ad2ab	decl	0x48(%rbx)
00000000000ad2ae	jmp	0xad2dd
00000000000ad2b0	movl	0x8(%r14), %ecx
00000000000ad2b4	cmpl	$0x1, %ecx
00000000000ad2b7	jne	0xad2d7
00000000000ad2b9	leaq	0x10(%r14), %rsi
00000000000ad2bd	leaq	0x4(%rdx), %r15
00000000000ad2c1	cmpq	%rax, %rsi
00000000000ad2c4	je	0xad2ce
00000000000ad2c6	movq	%r14, %rdi
00000000000ad2c9	callq	0xde966                         ## symbol stub for: _memmove
00000000000ad2ce	addq	%r15, %r14
00000000000ad2d1	movq	%r14, 0x58(%rbx)
00000000000ad2d5	jmp	0xad2dd
00000000000ad2d7	decl	%ecx
00000000000ad2d9	movl	%ecx, 0x8(%r14)
00000000000ad2dd	movq	%rbx, %rdi
00000000000ad2e0	addq	$0x8, %rsp
00000000000ad2e4	popq	%rbx
00000000000ad2e5	popq	%r14
00000000000ad2e7	popq	%r15
00000000000ad2e9	popq	%rbp
00000000000ad2ea	jmp	0xde65a                         ## symbol stub for: __ZNSt3__15mutex6unlockEv
00000000000ad2ef	movq	%rax, %rdi
00000000000ad2f2	callq	___clang_call_terminate
00000000000ad2f7	addb	%dl, 0x48(%rbp)
00000000000ad2fa	movl	%esp, %ebp
00000000000ad2fc	leaq	0x840af(%rip), %rdi             ## literal pool for: "vector"
00000000000ad303	callq	__ZNSt3__120__throw_length_errorB9nqe210106EPKc ## std::__1::__throw_length_error[abi:nqe210106](char const*)
