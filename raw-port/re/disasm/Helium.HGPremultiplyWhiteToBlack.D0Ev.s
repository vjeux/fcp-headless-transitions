__ZN25HGPremultiplyWhiteToBlackD0Ev:
0000000000157ff0	pushq	%rbp
0000000000157ff1	movq	%rsp, %rbp
0000000000157ff4	pushq	%rbx
0000000000157ff5	pushq	%rax
0000000000157ff6	movq	%rdi, %rbx
0000000000157ff9	leaq	0x8c8608(%rip), %rax
0000000000158000	movq	%rax, (%rdi)
0000000000158003	movq	0x198(%rdi), %rdi
000000000015800a	movq	(%rdi), %rax
000000000015800d	callq	*0x18(%rax)
0000000000158010	movq	%rbx, %rdi
0000000000158013	callq	__ZN6HGNodeD2Ev                 ## HGNode::~HGNode()
0000000000158018	movq	%rbx, %rdi
000000000015801b	addq	$0x8, %rsp
000000000015801f	popq	%rbx
0000000000158020	popq	%rbp
0000000000158021	jmp	__ZN8HGObjectdlEPv              ## HGObject::operator delete(void*)
0000000000158026	movq	%rax, %rdi
0000000000158029	callq	___clang_call_terminate
000000000015802e	nop
