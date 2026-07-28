__ZN13PCSharedMutexC2Ev:
00000000000aced8	pushq	%rbp
00000000000aced9	movq	%rsp, %rbp
00000000000acedc	pushq	%r15
00000000000acede	pushq	%r14
00000000000acee0	pushq	%rbx
00000000000acee1	pushq	%rax
00000000000acee2	movq	%rdi, %rbx
00000000000acee5	movq	$0x32aaaba7, (%rdi)             ## imm = 0x32AAABA7
00000000000aceec	leaq	0x50(%rdi), %r14
00000000000acef0	xorps	%xmm0, %xmm0
00000000000acef3	movups	%xmm0, 0x50(%rdi)
00000000000acef7	movq	$0x0, 0x60(%rdi)
00000000000aceff	movups	%xmm0, 0x8(%rdi)
00000000000acf03	movups	%xmm0, 0x18(%rdi)
00000000000acf07	movups	%xmm0, 0x28(%rdi)
00000000000acf0b	movups	%xmm0, 0x38(%rdi)
00000000000acf0f	movl	$0x0, 0x48(%rdi)
00000000000acf16	movl	$0x3, %esi
00000000000acf1b	movq	%r14, %rdi
00000000000acf1e	callq	__ZNSt3__16vectorIN13PCSharedMutex10ReaderInfoENS_9allocatorIS2_EEE7reserveEm ## std::__1::vector<PCSharedMutex::ReaderInfo, std::__1::allocator<PCSharedMutex::ReaderInfo>>::reserve(unsigned long)
00000000000acf23	addq	$0x8, %rsp
00000000000acf27	popq	%rbx
00000000000acf28	popq	%r14
00000000000acf2a	popq	%r15
00000000000acf2c	popq	%rbp
00000000000acf2d	retq
00000000000acf2e	movq	%rax, %r15
00000000000acf31	movq	(%r14), %rdi
00000000000acf34	testq	%rdi, %rdi
00000000000acf37	je	0xacf42
00000000000acf39	movq	%rdi, 0x58(%rbx)
00000000000acf3d	callq	0xde6c0                         ## symbol stub for: __ZdlPv
00000000000acf42	movq	%rbx, %rdi
00000000000acf45	callq	0xde660                         ## symbol stub for: __ZNSt3__15mutexD1Ev
00000000000acf4a	movq	%r15, %rdi
00000000000acf4d	callq	0xde50a                         ## symbol stub for: __Unwind_Resume
