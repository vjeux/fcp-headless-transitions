__ZN8cc_YCbCrmLERK9cc_matrix:
000000000009731e	pushq	%rbp
000000000009731f	movq	%rsp, %rbp
0000000000097322	pushq	%rbx
0000000000097323	pushq	%rax
0000000000097324	movq	%rdi, %rbx
0000000000097327	callq	__ZNK8cc_YCbCrmlERK9cc_matrix   ## cc_YCbCr::operator*(cc_matrix const&) const
000000000009732c	movlps	%xmm0, (%rbx)
000000000009732f	movq	%rax, 0x8(%rbx)
0000000000097333	addq	$0x8, %rsp
0000000000097337	popq	%rbx
0000000000097338	popq	%rbp
0000000000097339	retq
