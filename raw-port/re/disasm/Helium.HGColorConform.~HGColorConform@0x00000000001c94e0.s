__ZN14HGColorConformD0Ev:
00000000001c94e0	pushq	%rbp
00000000001c94e1	movq	%rsp, %rbp
00000000001c94e4	pushq	%rbx
00000000001c94e5	pushq	%rax
00000000001c94e6	movq	%rdi, %rbx
00000000001c94e9	callq	__ZN14HGColorConformD2Ev        ## HGColorConform::~HGColorConform()
00000000001c94ee	movq	%rbx, %rdi
00000000001c94f1	addq	$0x8, %rsp
00000000001c94f5	popq	%rbx
00000000001c94f6	popq	%rbp
00000000001c94f7	jmp	__ZN8HGObjectdlEPv              ## HGObject::operator delete(void*)
00000000001c94fc	nopl	(%rax)
