__ZN18HGHybridQTGammaLog6DecodeD2Ev:
00000000001021b0	pushq	%rbp
00000000001021b1	movq	%rsp, %rbp
00000000001021b4	pushq	%rbx
00000000001021b5	pushq	%rax
00000000001021b6	leaq	0x916183(%rip), %rax
00000000001021bd	movq	%rax, (%rdi)
00000000001021c0	movq	0x198(%rdi), %rax
00000000001021c7	testq	%rax, %rax
00000000001021ca	je	0x1021db
00000000001021cc	movq	(%rax), %rcx
00000000001021cf	movq	%rdi, %rbx
00000000001021d2	movq	%rax, %rdi
00000000001021d5	callq	*0x18(%rcx)
00000000001021d8	movq	%rbx, %rdi
00000000001021db	addq	$0x8, %rsp
00000000001021df	popq	%rbx
00000000001021e0	popq	%rbp
00000000001021e1	jmp	__ZN6HGNodeD2Ev                 ## HGNode::~HGNode()
00000000001021e6	movq	%rax, %rdi
00000000001021e9	callq	___clang_call_terminate
00000000001021ee	nop
