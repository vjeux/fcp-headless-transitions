__ZN19HGAntiAliasLUTEntryD0Ev:
0000000000212020	pushq	%rbp
0000000000212021	movq	%rsp, %rbp
0000000000212024	pushq	%rbx
0000000000212025	pushq	%rax
0000000000212026	movq	%rdi, %rbx
0000000000212029	leaq	0x81d638(%rip), %rax
0000000000212030	movq	%rax, (%rdi)
0000000000212033	movq	0x20(%rdi), %rdi
0000000000212037	testq	%rdi, %rdi
000000000021203a	je	0x212042
000000000021203c	movq	(%rdi), %rax
000000000021203f	callq	*0x18(%rax)
0000000000212042	movq	0x18(%rbx), %rdi
0000000000212046	testq	%rdi, %rdi
0000000000212049	je	0x212051
000000000021204b	movq	(%rdi), %rax
000000000021204e	callq	*0x18(%rax)
0000000000212051	movq	%rbx, %rdi
0000000000212054	callq	__ZN10HGLUTCache8LUTEntryD2Ev   ## HGLUTCache::LUTEntry::~LUTEntry()
0000000000212059	movq	%rbx, %rdi
000000000021205c	addq	$0x8, %rsp
0000000000212060	popq	%rbx
0000000000212061	popq	%rbp
0000000000212062	jmp	0x3c4fa0                        ## symbol stub for: __ZdlPv
0000000000212067	movq	%rax, %rdi
000000000021206a	callq	___clang_call_terminate
000000000021206f	movq	%rax, %rdi
0000000000212072	callq	___clang_call_terminate
0000000000212077	nopw	(%rax,%rax)
