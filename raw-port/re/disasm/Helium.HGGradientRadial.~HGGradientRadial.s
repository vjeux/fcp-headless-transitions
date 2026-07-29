__ZN16HGGradientRadialD0Ev:
000000000008beb0	pushq	%rbp
000000000008beb1	movq	%rsp, %rbp
000000000008beb4	pushq	%rbx
000000000008beb5	pushq	%rax
000000000008beb6	movq	%rdi, %rbx
000000000008beb9	leaq	0x97e120(%rip), %rax
000000000008bec0	movq	%rax, (%rdi)
000000000008bec3	movq	0x1a0(%rdi), %rdi
000000000008beca	testq	%rdi, %rdi
000000000008becd	je	0x8bed5
000000000008becf	movq	(%rdi), %rax
000000000008bed2	callq	*0x18(%rax)
000000000008bed5	movq	%rbx, %rdi
000000000008bed8	callq	__ZN6HGNodeD2Ev                 ## HGNode::~HGNode()
000000000008bedd	movq	%rbx, %rdi
000000000008bee0	addq	$0x8, %rsp
000000000008bee4	popq	%rbx
000000000008bee5	popq	%rbp
000000000008bee6	jmp	__ZN8HGObjectdlEPv              ## HGObject::operator delete(void*)
000000000008beeb	movq	%rax, %rdi
000000000008beee	callq	___clang_call_terminate
000000000008bef3	nopw	%cs:(%rax,%rax)
