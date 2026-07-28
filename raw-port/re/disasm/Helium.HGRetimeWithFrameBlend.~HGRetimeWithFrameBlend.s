__ZN22HGRetimeWithFrameBlendD0Ev:
00000000001e3920	pushq	%rbp
00000000001e3921	movq	%rsp, %rbp
00000000001e3924	pushq	%rbx
00000000001e3925	pushq	%rax
00000000001e3926	movq	%rdi, %rbx
00000000001e3929	leaq	0x847c98(%rip), %rax
00000000001e3930	movq	%rax, (%rdi)
00000000001e3933	movq	0x1a0(%rdi), %rdi
00000000001e393a	testq	%rdi, %rdi
00000000001e393d	je	0x1e3945
00000000001e393f	movq	(%rdi), %rax
00000000001e3942	callq	*0x18(%rax)
00000000001e3945	movq	%rbx, %rdi
00000000001e3948	callq	__ZN6HGNodeD2Ev                 ## HGNode::~HGNode()
00000000001e394d	movq	%rbx, %rdi
00000000001e3950	addq	$0x8, %rsp
00000000001e3954	popq	%rbx
00000000001e3955	popq	%rbp
00000000001e3956	jmp	__ZN8HGObjectdlEPv              ## HGObject::operator delete(void*)
00000000001e395b	movq	%rax, %rdi
00000000001e395e	callq	___clang_call_terminate
00000000001e3963	nopw	%cs:(%rax,%rax)
