__ZN11HGColorBiasD1Ev:
00000000001a0d80	pushq	%rbp
00000000001a0d81	movq	%rsp, %rbp
00000000001a0d84	pushq	%rbx
00000000001a0d85	pushq	%rax
00000000001a0d86	leaq	0x883adb(%rip), %rax
00000000001a0d8d	movq	%rax, (%rdi)
00000000001a0d90	movq	0x198(%rdi), %rax
00000000001a0d97	testq	%rax, %rax
00000000001a0d9a	je	0x1a0dab
00000000001a0d9c	movq	(%rax), %rcx
00000000001a0d9f	movq	%rdi, %rbx
00000000001a0da2	movq	%rax, %rdi
00000000001a0da5	callq	*0x18(%rcx)
00000000001a0da8	movq	%rbx, %rdi
00000000001a0dab	addq	$0x8, %rsp
00000000001a0daf	popq	%rbx
00000000001a0db0	popq	%rbp
00000000001a0db1	jmp	__ZN6HGNodeD2Ev                 ## HGNode::~HGNode()
00000000001a0db6	movq	%rax, %rdi
00000000001a0db9	callq	___clang_call_terminate
00000000001a0dbe	nop
