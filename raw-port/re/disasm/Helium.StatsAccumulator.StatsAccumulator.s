__ZN16StatsAccumulatorC1Ev:
00000000000f2fc0	pushq	%rbp
00000000000f2fc1	movq	%rsp, %rbp
00000000000f2fc4	pushq	%r14
00000000000f2fc6	pushq	%rbx
00000000000f2fc7	movq	%rdi, %rbx
00000000000f2fca	xorps	%xmm0, %xmm0
00000000000f2fcd	movups	%xmm0, 0xc(%rdi)
00000000000f2fd1	movups	%xmm0, (%rdi)
00000000000f2fd4	leaq	0x7f3eba(%rip), %rdi            ## literal pool for: "stats"
00000000000f2fdb	movl	$0x1, %esi
00000000000f2fe0	callq	__ZN8HGLogger8setLevelEPKci     ## HGLogger::setLevel(char const*, int)
00000000000f2fe5	movq	(%rbx), %rax
00000000000f2fe8	movq	0x8(%rbx), %rcx
00000000000f2fec	subq	%rax, %rcx
00000000000f2fef	movq	%rcx, %rdx
00000000000f2ff2	sarq	$0x2, %rdx
00000000000f2ff6	cmpq	$0x31, %rdx
00000000000f2ffa	ja	0xf300e
00000000000f2ffc	movl	$0x32, %esi
00000000000f3001	subq	%rdx, %rsi
00000000000f3004	movq	%rbx, %rdi
00000000000f3007	callq	__ZNSt3__16vectorIfNS_9allocatorIfEEE8__appendEm ## std::__1::vector<float, std::__1::allocator<float>>::__append(unsigned long)
00000000000f300c	jmp	0xf3021
00000000000f300e	cmpq	$0xc8, %rcx
00000000000f3015	je	0xf3021
00000000000f3017	addq	$0xc8, %rax
00000000000f301d	movq	%rax, 0x8(%rbx)
00000000000f3021	movl	0x18(%rbx), %eax
00000000000f3024	cmpl	$0x31, %eax
00000000000f3027	movl	$0x31, %ecx
00000000000f302c	cmovll	%eax, %ecx
00000000000f302f	movl	%ecx, 0x18(%rbx)
00000000000f3032	popq	%rbx
00000000000f3033	popq	%r14
00000000000f3035	popq	%rbp
00000000000f3036	retq
00000000000f3037	movq	%rax, %r14
00000000000f303a	movq	(%rbx), %rdi
00000000000f303d	testq	%rdi, %rdi
00000000000f3040	je	0xf304b
00000000000f3042	movq	%rdi, 0x8(%rbx)
00000000000f3046	callq	0x3c4fa0                        ## symbol stub for: __ZdlPv
00000000000f304b	movq	%r14, %rdi
00000000000f304e	callq	0x3c4e02                        ## symbol stub for: __Unwind_Resume
00000000000f3053	nopw	%cs:(%rax,%rax)
