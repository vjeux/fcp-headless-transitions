__ZN11HGColorBiasD0Ev:
00000000001a0dc0	pushq	%rbp
00000000001a0dc1	movq	%rsp, %rbp
00000000001a0dc4	pushq	%rbx
00000000001a0dc5	pushq	%rax
00000000001a0dc6	movq	%rdi, %rbx
00000000001a0dc9	leaq	0x883a98(%rip), %rax
00000000001a0dd0	movq	%rax, (%rdi)
00000000001a0dd3	movq	0x198(%rdi), %rdi
00000000001a0dda	testq	%rdi, %rdi
00000000001a0ddd	je	0x1a0de5
00000000001a0ddf	movq	(%rdi), %rax
00000000001a0de2	callq	*0x18(%rax)
00000000001a0de5	movq	%rbx, %rdi
00000000001a0de8	callq	__ZN6HGNodeD2Ev                 ## HGNode::~HGNode()
00000000001a0ded	movq	%rbx, %rdi
00000000001a0df0	addq	$0x8, %rsp
00000000001a0df4	popq	%rbx
00000000001a0df5	popq	%rbp
00000000001a0df6	jmp	__ZN8HGObjectdlEPv              ## HGObject::operator delete(void*)
00000000001a0dfb	movq	%rax, %rdi
00000000001a0dfe	callq	___clang_call_terminate
00000000001a0e03	nopw	%cs:(%rax,%rax)
