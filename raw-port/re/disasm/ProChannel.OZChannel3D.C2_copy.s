__ZN11OZChannel3DC2ERKS_P15OZChannelFolder:
00000000000490e4	pushq	%rbp
00000000000490e5	movq	%rsp, %rbp
00000000000490e8	pushq	%r14
00000000000490ea	pushq	%rbx
00000000000490eb	movq	%rsi, %r14
00000000000490ee	movq	%rdi, %rbx
00000000000490f1	callq	__ZN11OZChannel2DC2ERKS_P15OZChannelFolder ## OZChannel2D::OZChannel2D(OZChannel2D const&, OZChannelFolder*)
00000000000490f6	leaq	0x8da43(%rip), %rax
00000000000490fd	movq	%rax, (%rbx)
0000000000049100	leaq	0x8dd89(%rip), %rax
0000000000049107	movq	%rax, 0x10(%rbx)
000000000004910b	movl	$0x1b8, %eax                    ## imm = 0x1B8
0000000000049110	leaq	(%rbx,%rax), %rdi
0000000000049114	addq	%rax, %r14
0000000000049117	movq	%r14, %rsi
000000000004911a	movq	%rbx, %rdx
000000000004911d	callq	__ZN9OZChannelC2ERKS_P15OZChannelFolder ## OZChannel::OZChannel(OZChannel const&, OZChannelFolder*)
0000000000049122	leaq	__ZTV15OZChannelDouble(%rip), %rax ## vtable for OZChannelDouble
0000000000049129	leaq	0x10(%rax), %rcx
000000000004912d	movq	%rcx, 0x1b8(%rbx)
0000000000049134	addq	$0x370, %rax                    ## imm = 0x370
000000000004913a	movq	%rax, 0x1c8(%rbx)
0000000000049141	popq	%rbx
0000000000049142	popq	%r14
0000000000049144	popq	%rbp
0000000000049145	retq
0000000000049146	movq	%rax, %r14
0000000000049149	movq	%rbx, %rdi
000000000004914c	callq	__ZN11OZChannel2DD2Ev           ## OZChannel2D::~OZChannel2D()
0000000000049151	movq	%r14, %rdi
0000000000049154	callq	0xacaf2                         ## symbol stub for: __Unwind_Resume
0000000000049159	nop
