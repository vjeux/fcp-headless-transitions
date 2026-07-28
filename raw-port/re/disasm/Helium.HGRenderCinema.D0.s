__ZN14HGRenderCinemaD0Ev:
00000000000f3800	pushq	%rbp
00000000000f3801	movq	%rsp, %rbp
00000000000f3804	pushq	%rbx
00000000000f3805	pushq	%rax
00000000000f3806	movq	%rdi, %rbx
00000000000f3809	leaq	0x91e9c8(%rip), %rax
00000000000f3810	movq	%rax, (%rdi)
00000000000f3813	movq	0x198(%rdi), %rdi
00000000000f381a	testq	%rdi, %rdi
00000000000f381d	je	0xf3825
00000000000f381f	movq	(%rdi), %rax
00000000000f3822	callq	*0x18(%rax)
00000000000f3825	movq	%rbx, %rdi
00000000000f3828	callq	__ZN6HGNodeD2Ev                 ## HGNode::~HGNode()
00000000000f382d	movq	%rbx, %rdi
00000000000f3830	addq	$0x8, %rsp
00000000000f3834	popq	%rbx
00000000000f3835	popq	%rbp
00000000000f3836	jmp	__ZN8HGObjectdlEPv              ## HGObject::operator delete(void*)
00000000000f383b	movq	%rax, %rdi
00000000000f383e	callq	___clang_call_terminate
00000000000f3843	nopw	%cs:(%rax,%rax)
