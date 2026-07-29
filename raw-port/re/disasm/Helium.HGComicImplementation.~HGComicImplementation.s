__ZN21HGComicImplementationD0Ev:
0000000000128310	pushq	%rbp
0000000000128311	movq	%rsp, %rbp
0000000000128314	pushq	%rbx
0000000000128315	pushq	%rax
0000000000128316	movq	%rdi, %rbx
0000000000128319	leaq	0x8f5c10(%rip), %rax
0000000000128320	movq	%rax, (%rdi)
0000000000128323	movq	0x68(%rdi), %rdi
0000000000128327	testq	%rdi, %rdi
000000000012832a	je	0x128332
000000000012832c	movq	(%rdi), %rax
000000000012832f	callq	*0x18(%rax)
0000000000128332	movq	%rbx, %rdi
0000000000128335	callq	__ZN8HGObjectD2Ev               ## HGObject::~HGObject()
000000000012833a	movq	%rbx, %rdi
000000000012833d	addq	$0x8, %rsp
0000000000128341	popq	%rbx
0000000000128342	popq	%rbp
0000000000128343	jmp	__ZN8HGObjectdlEPv              ## HGObject::operator delete(void*)
0000000000128348	movq	%rax, %rdi
000000000012834b	callq	___clang_call_terminate
