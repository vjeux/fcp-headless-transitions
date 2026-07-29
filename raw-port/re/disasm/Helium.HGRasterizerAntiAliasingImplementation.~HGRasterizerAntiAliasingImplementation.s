__ZN38HGRasterizerAntiAliasingImplementationD0Ev:
00000000001a0590	pushq	%rbp
00000000001a0591	movq	%rsp, %rbp
00000000001a0594	pushq	%rbx
00000000001a0595	pushq	%rax
00000000001a0596	movq	%rdi, %rbx
00000000001a0599	callq	__ZN8HGObjectD2Ev               ## HGObject::~HGObject()
00000000001a059e	movq	%rbx, %rdi
00000000001a05a1	addq	$0x8, %rsp
00000000001a05a5	popq	%rbx
00000000001a05a6	popq	%rbp
00000000001a05a7	jmp	__ZN8HGObjectdlEPv              ## HGObject::operator delete(void*)
00000000001a05ac	nopl	(%rax)
