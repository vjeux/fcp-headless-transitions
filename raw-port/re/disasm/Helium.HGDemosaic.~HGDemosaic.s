__ZN10HGDemosaicD0Ev:
00000000000dd9f0	pushq	%rbp
00000000000dd9f1	movq	%rsp, %rbp
00000000000dd9f4	pushq	%rbx
00000000000dd9f5	pushq	%rax
00000000000dd9f6	movq	%rdi, %rbx
00000000000dd9f9	leaq	0x92f490(%rip), %rax
00000000000dda00	movq	%rax, (%rdi)
00000000000dda03	movq	0x198(%rdi), %rdi
00000000000dda0a	testq	%rdi, %rdi
00000000000dda0d	je	0xdda15
00000000000dda0f	movq	(%rdi), %rax
00000000000dda12	callq	*0x18(%rax)
00000000000dda15	movq	%rbx, %rdi
00000000000dda18	callq	__ZN6HGNodeD2Ev                 ## HGNode::~HGNode()
00000000000dda1d	movq	%rbx, %rdi
00000000000dda20	addq	$0x8, %rsp
00000000000dda24	popq	%rbx
00000000000dda25	popq	%rbp
00000000000dda26	jmp	__ZN8HGObjectdlEPv              ## HGObject::operator delete(void*)
00000000000dda2b	movq	%rax, %rdi
00000000000dda2e	callq	___clang_call_terminate
00000000000dda33	nopw	%cs:(%rax,%rax)
