__ZN4HGPQ4OOTFD1Ev:
00000000000fe280	pushq	%rbp
00000000000fe281	movq	%rsp, %rbp
00000000000fe284	pushq	%rbx
00000000000fe285	pushq	%rax
00000000000fe286	leaq	0x917ef3(%rip), %rax
00000000000fe28d	movq	%rax, (%rdi)
00000000000fe290	movq	0x198(%rdi), %rax
00000000000fe297	testq	%rax, %rax
00000000000fe29a	je	0xfe2ab
00000000000fe29c	movq	(%rax), %rcx
00000000000fe29f	movq	%rdi, %rbx
00000000000fe2a2	movq	%rax, %rdi
00000000000fe2a5	callq	*0x18(%rcx)
00000000000fe2a8	movq	%rbx, %rdi
00000000000fe2ab	addq	$0x8, %rsp
00000000000fe2af	popq	%rbx
00000000000fe2b0	popq	%rbp
00000000000fe2b1	jmp	__ZN6HGNodeD2Ev                 ## HGNode::~HGNode()
00000000000fe2b6	movq	%rax, %rdi
00000000000fe2b9	callq	___clang_call_terminate
00000000000fe2be	nop
