__ZN19BorderPaddingPolicyD0Ev:
00000000000451d0	pushq	%rbp
00000000000451d1	movq	%rsp, %rbp
00000000000451d4	pushq	%rbx
00000000000451d5	pushq	%rax
00000000000451d6	movq	%rdi, %rbx
00000000000451d9	callq	__ZN8HGObjectD2Ev               ## HGObject::~HGObject()
00000000000451de	movq	%rbx, %rdi
00000000000451e1	addq	$0x8, %rsp
00000000000451e5	popq	%rbx
00000000000451e6	popq	%rbp
00000000000451e7	jmp	__ZN8HGObjectdlEPv              ## HGObject::operator delete(void*)
00000000000451ec	nopl	(%rax)
