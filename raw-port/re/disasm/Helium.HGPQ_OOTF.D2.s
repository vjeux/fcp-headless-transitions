__ZN4HGPQ4OOTFD2Ev:
00000000000fe240	pushq	%rbp
00000000000fe241	movq	%rsp, %rbp
00000000000fe244	pushq	%rbx
00000000000fe245	pushq	%rax
00000000000fe246	leaq	0x917f33(%rip), %rax
00000000000fe24d	movq	%rax, (%rdi)
00000000000fe250	movq	0x198(%rdi), %rax
00000000000fe257	testq	%rax, %rax
00000000000fe25a	je	0xfe26b
00000000000fe25c	movq	(%rax), %rcx
00000000000fe25f	movq	%rdi, %rbx
00000000000fe262	movq	%rax, %rdi
00000000000fe265	callq	*0x18(%rcx)
00000000000fe268	movq	%rbx, %rdi
00000000000fe26b	addq	$0x8, %rsp
00000000000fe26f	popq	%rbx
00000000000fe270	popq	%rbp
00000000000fe271	jmp	__ZN6HGNodeD2Ev                 ## HGNode::~HGNode()
00000000000fe276	movq	%rax, %rdi
00000000000fe279	callq	___clang_call_terminate
00000000000fe27e	nop
