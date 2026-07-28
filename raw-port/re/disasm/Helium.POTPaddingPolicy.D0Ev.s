__ZN16POTPaddingPolicyD0Ev:
00000000000450a0	pushq	%rbp
00000000000450a1	movq	%rsp, %rbp
00000000000450a4	pushq	%rbx
00000000000450a5	pushq	%rax
00000000000450a6	movq	%rdi, %rbx
00000000000450a9	callq	__ZN8HGObjectD2Ev               ## HGObject::~HGObject()
00000000000450ae	movq	%rbx, %rdi
00000000000450b1	addq	$0x8, %rsp
00000000000450b5	popq	%rbx
00000000000450b6	popq	%rbp
00000000000450b7	jmp	__ZN8HGObjectdlEPv              ## HGObject::operator delete(void*)
00000000000450bc	nopl	(%rax)
