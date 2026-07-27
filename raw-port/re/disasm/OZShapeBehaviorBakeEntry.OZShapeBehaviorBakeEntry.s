__ZN24OZShapeBehaviorBakeEntryC2EiR11PCTimeRange6CMTime:
00000000003e44b0	pushq	%rbp
00000000003e44b1	movq	%rsp, %rbp
00000000003e44b4	pushq	%r14
00000000003e44b6	pushq	%rbx
00000000003e44b7	subq	$0x50, %rsp
00000000003e44bb	movq	%rdx, %rax
00000000003e44be	movq	%rdi, %rbx
00000000003e44c1	leaq	0x10(%rbp), %rdx
00000000003e44c5	leaq	0x8(%rdi), %rcx
00000000003e44c9	movq	0x440040(%rip), %rdi            ## literal pool symbol address: _kCMTimeZero
00000000003e44d0	movq	0x10(%rdi), %r8
00000000003e44d4	movq	%r8, 0x18(%rbx)
00000000003e44d8	movups	(%rdi), %xmm0
00000000003e44db	movups	%xmm0, 0x8(%rbx)
00000000003e44df	movups	(%rdi), %xmm0
00000000003e44e2	movups	%xmm0, 0x20(%rbx)
00000000003e44e6	movq	0x10(%rdi), %rdi
00000000003e44ea	movq	%rdi, 0x30(%rbx)
00000000003e44ee	xorps	%xmm0, %xmm0
00000000003e44f1	cvtsi2sd	%esi, %xmm0
00000000003e44f5	movsd	%xmm0, (%rbx)
00000000003e44f9	cmpq	%rax, %rcx
00000000003e44fc	je	0x3e4521
00000000003e44fe	leaq	0x20(%rbx), %rsi
00000000003e4502	movq	0x10(%rax), %rdi
00000000003e4506	movq	%rdi, 0x10(%rcx)
00000000003e450a	movups	(%rax), %xmm0
00000000003e450d	movups	%xmm0, (%rcx)
00000000003e4510	movq	0x28(%rax), %rcx
00000000003e4514	movq	%rcx, 0x10(%rsi)
00000000003e4518	movupd	0x18(%rax), %xmm0
00000000003e451d	movupd	%xmm0, (%rsi)
00000000003e4521	movq	0x28(%rax), %rcx
00000000003e4525	movq	%rcx, -0x20(%rbp)
00000000003e4529	movups	0x18(%rax), %xmm0
00000000003e452d	movaps	%xmm0, -0x30(%rbp)
00000000003e4531	leaq	-0x48(%rbp), %rdi
00000000003e4535	leaq	-0x30(%rbp), %rsi
00000000003e4539	callq	0x6dfc42                        ## symbol stub for: __ZdvRK6CMTimeS1_
00000000003e453e	movq	-0x38(%rbp), %rax
00000000003e4542	movq	%rax, 0x10(%rsp)
00000000003e4547	movupd	-0x48(%rbp), %xmm0
00000000003e454c	movupd	%xmm0, (%rsp)
00000000003e4551	callq	0x6dcac2                        ## symbol stub for: _CMTimeGetSeconds
00000000003e4556	cvttsd2si	%xmm0, %rax
00000000003e455b	movl	%eax, %r14d
00000000003e455e	shlq	$0x3, %r14
00000000003e4562	movq	%r14, %rdi
00000000003e4565	callq	0x6dfc96                        ## symbol stub for: __Znam
00000000003e456a	movq	%rax, 0x38(%rbx)
00000000003e456e	movq	%r14, %rdi
00000000003e4571	callq	0x6dfc96                        ## symbol stub for: __Znam
00000000003e4576	movq	%rax, 0x40(%rbx)
00000000003e457a	movq	%r14, %rdi
00000000003e457d	callq	0x6dfc96                        ## symbol stub for: __Znam
00000000003e4582	movq	%rax, 0x48(%rbx)
00000000003e4586	movq	%r14, %rdi
00000000003e4589	callq	0x6dfc96                        ## symbol stub for: __Znam
00000000003e458e	movq	%rax, 0x50(%rbx)
00000000003e4592	movq	%r14, %rdi
00000000003e4595	callq	0x6dfc96                        ## symbol stub for: __Znam
00000000003e459a	movq	%rax, 0x58(%rbx)
00000000003e459e	movq	%r14, %rdi
00000000003e45a1	callq	0x6dfc96                        ## symbol stub for: __Znam
00000000003e45a6	movq	%rax, 0x60(%rbx)
00000000003e45aa	addq	$0x50, %rsp
00000000003e45ae	popq	%rbx
00000000003e45af	popq	%r14
00000000003e45b1	popq	%rbp
00000000003e45b2	retq
00000000003e45b3	nopw	%cs:(%rax,%rax)
