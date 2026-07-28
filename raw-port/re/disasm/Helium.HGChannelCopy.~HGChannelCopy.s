__ZN13HGChannelCopyD0Ev:
000000000017a5d0	pushq	%rbp
000000000017a5d1	movq	%rsp, %rbp
000000000017a5d4	pushq	%rbx
000000000017a5d5	pushq	%rax
000000000017a5d6	movq	%rdi, %rbx
000000000017a5d9	leaq	0x8a84c8(%rip), %rax
000000000017a5e0	movq	%rax, (%rdi)
000000000017a5e3	movq	0x198(%rdi), %rdi
000000000017a5ea	movq	(%rdi), %rax
000000000017a5ed	callq	*0x18(%rax)
000000000017a5f0	movq	%rbx, %rdi
000000000017a5f3	callq	__ZN6HGNodeD2Ev                 ## HGNode::~HGNode()
000000000017a5f8	movq	%rbx, %rdi
000000000017a5fb	addq	$0x8, %rsp
000000000017a5ff	popq	%rbx
000000000017a600	popq	%rbp
000000000017a601	jmp	__ZN8HGObjectdlEPv              ## HGObject::operator delete(void*)
000000000017a606	movq	%rax, %rdi
000000000017a609	callq	___clang_call_terminate
000000000017a60e	nop
